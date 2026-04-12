import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";

const LEAD_STATUSES = [
  "NEW",
  "AVAILABLE",
  "DELIVERED",
  "REJECTED",
  "DUPLICATE",
  "UNREACHABLE",
  "QUALIFIED",
] as const;

export async function PATCH(req: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Interdit" }, { status: 403 });
  }

  const { id, status } = await req.json();
  if (!id || !LEAD_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Payload invalide" }, { status: 400 });
  }

  void id;
  void status;
  return NextResponse.json(
    { error: "Mise a jour lead temporairement indisponible" },
    { status: 501 },
  );
}
