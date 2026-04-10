import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireOrganizationRole } from "@/lib/organization";
import { createNotification } from "@/lib/notifications";

export async function PATCH(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { membership, user } = await requireOrganizationRole(["OWNER", "MANAGER"]);
    const { id } = await params;

    const request = await prisma.request.findFirst({
      where: {
        id,
        organizationId: membership.organizationId,
      },
    });

    if (!request) {
      return NextResponse.json({ error: "Campagne introuvable" }, { status: 404 });
    }

    const updated = await prisma.request.update({
      where: { id: request.id },
      data: {
        status: "APPROVED",
        approvedByUserId: user.id,
      },
    });

    await createNotification({
      userId: updated.createdByUserId || updated.userId,
      organizationId: updated.organizationId,
      requestId: updated.id,
      type: "CAMPAIGN_APPROVED",
      title: "Campagne approuvee",
      message: `Votre campagne ${updated.campaignName} est approuvee.`,
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        organizationId: membership.organizationId,
        action: "CAMPAIGN_APPROVED",
        targetType: "REQUEST",
        targetId: updated.id,
      },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Interdit" }, { status: 403 });
  }
}
