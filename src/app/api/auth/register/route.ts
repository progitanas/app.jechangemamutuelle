import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";
import { registerSchema } from "@/lib/schemas";

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Données invalides" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });
  if (existing) {
    return NextResponse.json({ error: "Email deja utilise" }, { status: 409 });
  }

  const isFirstUser = (await prisma.user.count()) === 0;

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  const user = await prisma.$transaction(async (tx) => {
    const createdUser = await tx.user.create({
      data: {
        firstName: parsed.data.firstName,
        lastName: parsed.data.lastName,
        email: parsed.data.email,
        passwordHash,
        role: isFirstUser ? "ADMIN" : "USER",
      },
    });

    const organization = await tx.organization.create({
      data: {
        name: `${parsed.data.firstName} ${parsed.data.lastName}`,
      },
    });

    await tx.organizationMember.create({
      data: {
        organizationId: organization.id,
        userId: createdUser.id,
        role: "OWNER",
      },
    });

    await tx.auditLog.create({
      data: {
        userId: createdUser.id,
        organizationId: organization.id,
        action: "ORGANIZATION_CREATED",
        targetType: "ORGANIZATION",
        targetId: organization.id,
      },
    });

    return createdUser;
  });

  await createSession({
    userId: user.id,
    role: user.role,
    email: user.email,
  });

  return NextResponse.json({ ok: true });
}

