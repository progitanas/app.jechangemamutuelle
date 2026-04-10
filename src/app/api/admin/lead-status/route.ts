import { NextResponse } from "next/server";
import { LeadStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function PATCH(req: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Interdit" }, { status: 403 });
  }

  const { id, status } = await req.json();
  if (!id || !Object.values(LeadStatus).includes(status)) {
    return NextResponse.json({ error: "Payload invalide" }, { status: 400 });
  }

  await prisma.lead.update({
    where: { id },
    data: {
      status,
      deliveredAt: status === "DELIVERED" ? new Date() : null,
    },
  });

  return NextResponse.json({ ok: true });
}
