import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  void req;
  return NextResponse.json(
    { error: "Paiement en cours de migration D1" },
    { status: 501 },
  );
}
