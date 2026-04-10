type NotificationType =
  | "ACTION_REQUIRED"
  | "CAMPAIGN_APPROVED"
  | "CAMPAIGN_SUSPENDED"
  | "LEAD_DELIVERED"
  | "BUDGET_LOW";

type NotificationInput = {
  userId: string;
  organizationId?: string | null;
  requestId?: string | null;
  type: NotificationType;
  title: string;
  message: string;
};

export async function createNotification(input: NotificationInput) {
  return {
    id: `notif_${Date.now()}`,
    userId: input.userId,
    organizationId: input.organizationId || null,
    requestId: input.requestId || null,
    type: input.type,
    title: input.title,
    message: input.message,
  };
}

export async function notifyOrganizationMembers(
  organizationId: string,
  payload: Omit<NotificationInput, "userId" | "organizationId">,
) {
  void organizationId;
  void payload;
}
