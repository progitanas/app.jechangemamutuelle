import { NotificationType } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

type NotificationInput = {
  userId: string;
  organizationId?: string | null;
  requestId?: string | null;
  type: NotificationType;
  title: string;
  message: string;
};

export async function createNotification(input: NotificationInput) {
  return prisma.notification.create({
    data: {
      userId: input.userId,
      organizationId: input.organizationId || null,
      requestId: input.requestId || null,
      type: input.type,
      title: input.title,
      message: input.message,
    },
  });
}

export async function notifyOrganizationMembers(
  organizationId: string,
  payload: Omit<NotificationInput, "userId" | "organizationId">,
) {
  const members = await prisma.organizationMember.findMany({
    where: { organizationId },
    select: { userId: true },
  });

  if (members.length === 0) return;

  await prisma.notification.createMany({
    data: members.map((member) => ({
      userId: member.userId,
      organizationId,
      requestId: payload.requestId || null,
      type: payload.type,
      title: payload.title,
      message: payload.message,
    })),
  });
}
