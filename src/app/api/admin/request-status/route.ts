import { NextResponse } from "next/server";
import { RequestStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
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

  const { id, status } = await req.json();
  if (!id || !Object.values(RequestStatus).includes(status)) {
    return NextResponse.json({ error: "Payload invalide" }, { status: 400 });
  }

  const updated = await prisma.request.update({
    where: { id },
    data: { status },
  });

  if (updated.organizationId) {
    await notifyOrganizationMembers(updated.organizationId, {
      type:
        status === "APPROVED"
          ? "CAMPAIGN_APPROVED"
          : status === "SUSPENDED"
            ? "CAMPAIGN_SUSPENDED"
            : "ACTION_REQUIRED",
      title: `Statut campagne: ${status}`,
      message: `La campagne ${updated.campaignName} est maintenant ${status}.`,
      requestId: updated.id,
    });
  } else {
    await createNotification({
      userId: updated.userId,
      organizationId: null,
      requestId: updated.id,
      type: "ACTION_REQUIRED",
      title: `Statut campagne: ${status}`,
      message: `La campagne ${updated.campaignName} est maintenant ${status}.`,
    });
  }

  await prisma.auditLog.create({
    data: {
      userId: adminUserId,
      organizationId: updated.organizationId,
      action: "CAMPAIGN_STATUS_UPDATED",
      targetType: "REQUEST",
      targetId: updated.id,
      details: `Status ${status}`,
    },
  });

  return NextResponse.json({ ok: true });
}
