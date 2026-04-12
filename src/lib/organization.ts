import { requireAuth } from "@/lib/auth";

export type OrganizationRole = "OWNER" | "MANAGER" | "BUYER";

type Membership = {
  organizationId: string;
  role: OrganizationRole;
  organization: { id: string; name: string };
};

export async function getPrimaryMembership(userId: string) {
  return {
    organizationId: "default-org",
    role: "OWNER",
    organization: { id: "default-org", name: "Organisation Principale" },
  } satisfies Membership;
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
