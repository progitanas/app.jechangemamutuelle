import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireOrganizationRole } from "@/lib/organization";

const addMemberSchema = z.object({
  email: z.email("Email invalide"),
  role: z.enum(["OWNER", "MANAGER", "BUYER"]),
});

export async function GET() {
  try {
    const { membership } = await requireOrganizationRole([
      "OWNER",
      "MANAGER",
      "BUYER",
    ]);

    const members = await prisma.organizationMember.findMany({
      where: { organizationId: membership.organizationId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ ok: true, members });
  } catch {
    return NextResponse.json({ error: "Interdit" }, { status: 403 });
  }
}

export async function POST(req: Request) {
  try {
    const { membership, user: actor } = await requireOrganizationRole([
      "OWNER",
      "MANAGER",
    ]);

    const body = await req.json();
    const parsed = addMemberSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Payload invalide" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email },
    });

    if (!user) {
      return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
    }

    await prisma.organizationMember.upsert({
      where: {
        organizationId_userId: {
          organizationId: membership.organizationId,
          userId: user.id,
        },
      },
      create: {
        organizationId: membership.organizationId,
        userId: user.id,
        role: parsed.data.role,
      },
      update: {
        role: parsed.data.role,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: actor.id,
        organizationId: membership.organizationId,
        action: "TEAM_MEMBER_UPDATED",
        targetType: "USER",
        targetId: user.id,
        details: `Role ${parsed.data.role}`,
      },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Interdit" }, { status: 403 });
  }
}
