import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { leadDisputeReviewSchema } from "@/lib/schemas";

export async function PATCH(req: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Interdit" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = leadDisputeReviewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Payload invalide" }, { status: 400 });
  }

  void parsed;
  return NextResponse.json(
    { error: "Revue de litige en migration D1" },
    { status: 501 },
  );
}
