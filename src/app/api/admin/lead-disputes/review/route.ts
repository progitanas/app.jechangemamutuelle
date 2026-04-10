import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { leadDisputeReviewSchema } from "@/lib/schemas";
import {
  createNotification,
  notifyOrganizationMembers,
} from "@/lib/notifications";

export async function PATCH(req: Request) {
  let adminUserId = "";
  try {
    const admin = await requireAdmin();
    adminUserId = admin.id;
  } catch {
    return NextResponse.json({ error: "Interdit" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = leadDisputeReviewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Payload invalide" }, { status: 400 });
  }

  const dispute = await prisma.leadDispute.findUnique({
    where: { id: parsed.data.disputeId },
    include: { lead: true, request: true },
  });

  if (!dispute) {
    return NextResponse.json({ error: "Litige introuvable" }, { status: 404 });
  }

  if (dispute.status !== "PENDING_REVIEW") {
    return NextResponse.json({ error: "Litige deja traite" }, { status: 409 });
  }

  if (parsed.data.decision === "REJECT") {
    await prisma.leadDispute.update({
      where: { id: dispute.id },
      data: {
        status: "REJECTED",
        resolutionComment: parsed.data.resolutionComment || null,
        resolvedAt: new Date(),
      },
    });

    if (dispute.request.organizationId) {
      await notifyOrganizationMembers(dispute.request.organizationId, {
        type: "ACTION_REQUIRED",
        title: "Rejet de lead refuse",
        message: `Le rejet sur le lead ${dispute.lead.title} a ete refuse.`,
        requestId: dispute.request.id,
      });
    } else {
      await createNotification({
        userId: dispute.userId,
        organizationId: null,
        requestId: dispute.request.id,
        type: "ACTION_REQUIRED",
        title: "Rejet de lead refuse",
        message: `Le rejet sur le lead ${dispute.lead.title} a ete refuse.`,
      });
    }

    await prisma.auditLog.create({
      data: {
        userId: adminUserId,
        organizationId: dispute.request.organizationId,
        action: "DISPUTE_REJECTED",
        targetType: "LEAD_DISPUTE",
        targetId: dispute.id,
      },
    });

    return NextResponse.json({ ok: true });
  }

  const replacement = await prisma.$transaction(async (tx) => {
    const replacementLead = await tx.lead.create({
      data: {
        requestId: dispute.lead.requestId,
        userId: dispute.lead.userId,
        title: `${dispute.lead.title} (remplacement)`,
        description: dispute.lead.description,
        contactName: dispute.lead.contactName,
        contactEmail: dispute.lead.contactEmail,
        contactPhone: dispute.lead.contactPhone,
        status: "AVAILABLE",
        deliveredAt: new Date(),
      },
    });

    await tx.lead.update({
      where: { id: dispute.lead.id },
      data: { status: "REJECTED" },
    });

    await tx.leadDispute.update({
      where: { id: dispute.id },
      data: {
        status: "ACCEPTED",
        replacementLeadId: replacementLead.id,
        resolutionComment: parsed.data.resolutionComment || null,
        resolvedAt: new Date(),
      },
    });

    await tx.request.update({
      where: { id: dispute.request.id },
      data: {
        leadsRejected: { increment: 1 },
        leadsDelivered: { increment: 1 },
        leadsAccepted: { increment: 1 },
      },
    });

    await tx.auditLog.create({
      data: {
        userId: adminUserId,
        organizationId: dispute.request.organizationId,
        action: "DISPUTE_ACCEPTED_REPLACED",
        targetType: "LEAD_DISPUTE",
        targetId: dispute.id,
      },
    });

    return replacementLead;
  });

  if (dispute.request.organizationId) {
    await notifyOrganizationMembers(dispute.request.organizationId, {
      type: "ACTION_REQUIRED",
      title: "Rejet accepte",
      message: `Le lead ${dispute.lead.title} a ete remplace automatiquement.`,
      requestId: dispute.request.id,
    });
  } else {
    await createNotification({
      userId: dispute.userId,
      organizationId: null,
      requestId: dispute.request.id,
      type: "ACTION_REQUIRED",
      title: "Rejet accepte",
      message: `Le lead ${dispute.lead.title} a ete remplace automatiquement.`,
    });
  }

  return NextResponse.json({ ok: true, replacementLeadId: replacement.id });
}
