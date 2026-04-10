import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { leadRejectSchema } from "@/lib/schemas";

const REJECTION_WINDOW_DAYS = 7;

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = leadRejectSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Payload invalide" }, { status: 400 });
  }

  const lead = await prisma.lead.findFirst({
    where: {
      id: parsed.data.leadId,
      userId: session.userId,
      status: { in: ["AVAILABLE", "DELIVERED"] },
    },
  });

  if (!lead) {
    return NextResponse.json({ error: "Lead introuvable" }, { status: 404 });
  }

  if (!lead.deliveredAt) {
    return NextResponse.json(
      { error: "Le lead doit etre livre avant rejet" },
      { status: 400 },
    );
  }

  const deadline = new Date(lead.deliveredAt);
  deadline.setDate(deadline.getDate() + REJECTION_WINDOW_DAYS);
  if (new Date() > deadline) {
    return NextResponse.json(
      { error: "Delai de rejet depasse" },
      { status: 400 },
    );
  }

  const existingPending = await prisma.leadDispute.findFirst({
    where: { leadId: lead.id, status: "PENDING_REVIEW" },
  });

  if (existingPending) {
    return NextResponse.json(
      { error: "Un rejet est deja en cours pour ce lead" },
      { status: 409 },
    );
  }

  await prisma.leadDispute.create({
    data: {
      leadId: lead.id,
      requestId: lead.requestId,
      userId: session.userId,
      reason: parsed.data.reason,
      details: parsed.data.details || null,
      status: "PENDING_REVIEW",
    },
  });

  return NextResponse.json({ ok: true });
}
