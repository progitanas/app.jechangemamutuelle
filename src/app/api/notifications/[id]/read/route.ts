import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  const { id } = await params;

  await prisma.notification.updateMany({
    where: { id, userId: session.userId },
    data: { isRead: true },
  });

  return NextResponse.json({ ok: true });
}
