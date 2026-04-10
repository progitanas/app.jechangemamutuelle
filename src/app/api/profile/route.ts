import { NextResponse } from "next/server";
import { profileSchema } from "@/lib/schemas";
import { getSession } from "@/lib/auth";
import { cloudflareApi } from "@/lib/cloudflare-api";

export async function PATCH(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = profileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Données invalides" }, { status: 400 });
  }

  try {
    await cloudflareApi("/v1/auth/profile", {
      method: "PATCH",
      body: JSON.stringify({
        email: session.email,
        ...parsed.data,
      }),
    });
  } catch {
    return NextResponse.json(
      { error: "Mise a jour impossible" },
      { status: 400 },
    );
  }

  return NextResponse.json({ ok: true });
}
