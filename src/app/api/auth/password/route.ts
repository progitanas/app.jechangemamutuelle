import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { passwordChangeSchema } from "@/lib/schemas";
import { cloudflareApi } from "@/lib/cloudflare-api";

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

  try {
    await cloudflareApi("/v1/auth/password", {
      method: "PATCH",
      body: JSON.stringify({
        email: session.email,
        currentPassword: parsed.data.currentPassword,
        newPassword: parsed.data.newPassword,
      }),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur mot de passe" },
      { status: 400 },
    );
  }

  return NextResponse.json({ ok: true });
}
