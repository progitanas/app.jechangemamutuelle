import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { leadSendSchema } from "@/lib/schemas";
import { deliverLeadToPartner } from "@/lib/delivery";
import { notifyOrganizationMembers } from "@/lib/notifications";

export async function POST(req: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Interdit" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = leadSendSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Payload invalide" }, { status: 400 });
  }

  const lead = await prisma.lead.findUnique({
    where: { id: parsed.data.leadId },
    include: { request: true },
  });

  if (!lead) {
    return NextResponse.json({ error: "Lead introuvable" }, { status: 404 });
  }

  const partner = await prisma.partner.findUnique({
    where: { id: parsed.data.partnerId },
  });

  if (!partner || !partner.isActive) {
    return NextResponse.json(
      { error: "Partenaire inactif ou introuvable" },
      { status: 404 },
    );
  }

  const deliveryResult = await deliverLeadToPartner({
    channel: parsed.data.channel,
    partner,
    lead: {
      id: lead.id,
      title: lead.title,
      description: lead.description,
      contactName: lead.contactName,
      contactEmail: lead.contactEmail,
      contactPhone: lead.contactPhone,
    },
    campaignName: lead.request.campaignName,
    crmRequested: lead.request.deliveryToCrm,
  });

  await prisma.$transaction([
    prisma.leadDelivery.create({
      data: {
        leadId: lead.id,
        partnerId: partner.id,
        channel: parsed.data.channel,
        status: "SENT",
        sentAt: new Date(),
        notes: [parsed.data.notes || "", deliveryResult.notes]
          .filter(Boolean)
          .join(" | "),
      },
    }),
    prisma.lead.update({
      where: { id: lead.id },
      data: {
        status: "DELIVERED",
        deliveredAt: new Date(),
      },
    }),
    prisma.request.update({
      where: { id: lead.requestId },
      data: {
        status: "DELIVERED",
        quotaConsumed: { increment: 1 },
        leadsDelivered: { increment: 1 },
        totalCost: { increment: lead.request.maxPricePerLead },
        avgCostPerLead: lead.request.maxPricePerLead,
      },
    }),
    prisma.auditLog.create({
      data: {
        userId: lead.userId,
        organizationId: lead.request.organizationId || null,
        action: "LEAD_DELIVERED",
        targetType: "LEAD",
        targetId: lead.id,
        details: `${partner.name} via ${parsed.data.channel}`,
      },
    }),
  ]);

  if (lead.request.organizationId) {
    await notifyOrganizationMembers(lead.request.organizationId, {
      type: "LEAD_DELIVERED",
      title: "Nouveau lead livre",
      message: `Lead ${lead.title} livre via ${parsed.data.channel}.`,
      requestId: lead.requestId,
    });
  }

  return NextResponse.json({ ok: true });
}
