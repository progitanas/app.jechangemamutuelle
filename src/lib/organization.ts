import { OrganizationRole } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function getPrimaryMembership(userId: string) {
  return prisma.organizationMember.findFirst({
    where: { userId },
    include: { organization: true },
    orderBy: { createdAt: "asc" },
  });
}

export async function requireOrganizationRole(allowed: OrganizationRole[]) {
  const user = await requireAuth();
  const membership = await getPrimaryMembership(user.id);

  if (!membership) {
    throw new Error("NO_ORGANIZATION");
  }

  if (!allowed.includes(membership.role)) {
    throw new Error("FORBIDDEN");
  }

  return { user, membership };
}
