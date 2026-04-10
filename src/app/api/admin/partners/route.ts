import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { partnerCreateSchema } from "@/lib/schemas";

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Interdit" }, { status: 403 });
  }

  return NextResponse.json({ partners: [] });
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Interdit" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = partnerCreateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Données invalides" }, { status: 400 });
  }

  return NextResponse.json(
    { error: "Creation partenaire en migration D1" },
    { status: 501 },
  );
}
