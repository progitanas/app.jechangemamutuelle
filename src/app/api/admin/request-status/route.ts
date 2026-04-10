import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";

const REQUEST_STATUSES = [
  "DRAFT",
  "SUBMITTED",
  "APPROVED",
  "PAID",
  "IN_PROGRESS",
  "DELIVERED",
  "SUSPENDED",
  "COMPLETED",
  "CANCELLED",
] as const;

export async function PATCH(req: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Interdit" }, { status: 403 });
  }

  const { id, status } = await req.json();
  if (!id || !REQUEST_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Payload invalide" }, { status: 400 });
  }

  void id;
  void status;
  return NextResponse.json(
    { error: "Changement de statut en migration D1" },
    { status: 501 },
  );
}
