import { NextResponse } from "next/server";
import {
  requireOrganizationRole,
  getPrimaryMembership,
} from "@/lib/organization";

export async function GET() {
  try {
    await requireOrganizationRole(["OWNER", "MANAGER", "BUYER"]);
    return NextResponse.json({ ok: true, invoices: [] });
  } catch {
    return NextResponse.json({ error: "Interdit" }, { status: 403 });
  }
}

export async function POST() {
  try {
    const { user } = await requireOrganizationRole(["OWNER", "MANAGER"]);
    const membership = await getPrimaryMembership(user.id);
    if (!membership) {
      return NextResponse.json(
        { error: "Aucune organisation" },
        { status: 400 },
      );
    }

    return NextResponse.json({
      error: "Facturation en cours de finalisation",
      organizationId: membership.organizationId,
    });
  } catch {
    return NextResponse.json({ error: "Interdit" }, { status: 403 });
  }
}
