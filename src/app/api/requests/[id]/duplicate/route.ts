import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  const { id } = await params;
  void id;
  return NextResponse.json(
    { error: "Duplication campagne en migration D1" },
    { status: 501 },
  );
}
