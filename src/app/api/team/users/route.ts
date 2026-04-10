import { NextResponse } from "next/server";
import { z } from "zod";
import { requireOrganizationRole } from "@/lib/organization";

const addMemberSchema = z.object({
  email: z.email("Email invalide"),
  role: z.enum(["OWNER", "MANAGER", "BUYER"]),
});

export async function GET() {
  try {
    await requireOrganizationRole(["OWNER", "MANAGER", "BUYER"]);
    return NextResponse.json({ ok: true, members: [] });
  } catch {
    return NextResponse.json({ error: "Interdit" }, { status: 403 });
  }
}

export async function POST(req: Request) {
  try {
    await requireOrganizationRole(["OWNER", "MANAGER"]);

    const body = await req.json();
    const parsed = addMemberSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Payload invalide" }, { status: 400 });
    }

    return NextResponse.json(
      {
        error: "Gestion d'equipe en migration D1",
        email: parsed.data.email,
        role: parsed.data.role,
      },
      { status: 501 },
    );
  } catch {
    return NextResponse.json({ error: "Interdit" }, { status: 403 });
  }
}
