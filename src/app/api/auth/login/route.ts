import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";
import { loginSchema } from "@/lib/schemas";

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Données invalides" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });
  if (!user) {
    return NextResponse.json(
      { error: "Identifiants invalides" },
      { status: 401 },
    );
  }

  const match = await bcrypt.compare(parsed.data.password, user.passwordHash);
  if (!match) {
    return NextResponse.json(
      { error: "Identifiants invalides" },
      { status: 401 },
    );
  }

  await createSession({ userId: user.id, role: user.role, email: user.email });

  return NextResponse.json({
    ok: true,
    redirectTo: user.role === "ADMIN" ? "/admin" : "/dashboard",
  });
}

