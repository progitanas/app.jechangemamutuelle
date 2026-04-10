import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { passwordChangeSchema } from "@/lib/schemas";

export async function PATCH(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = passwordChangeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Données invalides" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { passwordHash: true },
  });

  if (!user) {
    return NextResponse.json(
      { error: "Utilisateur introuvable" },
      { status: 404 },
    );
  }

  const matches = await bcrypt.compare(
    parsed.data.currentPassword,
    user.passwordHash,
  );

  if (!matches) {
    return NextResponse.json(
      { error: "Mot de passe actuel incorrect" },
      { status: 400 },
    );
  }

  const newPasswordHash = await bcrypt.hash(parsed.data.newPassword, 12);

  await prisma.user.update({
    where: { id: session.userId },
    data: { passwordHash: newPasswordHash },
  });

  return NextResponse.json({ ok: true });
}

