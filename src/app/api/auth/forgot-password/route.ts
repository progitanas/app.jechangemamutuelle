import { NextResponse } from "next/server";
import { z } from "zod";
import { cloudflareApi } from "@/lib/cloudflare-api";

const forgotSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const parsed = forgotSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Données invalides" }, { status: 400 });
  }

  try {
    const response = await cloudflareApi<{ ok: boolean; resetLink?: string }>(
      "/v1/auth/forgot-password",
      {
        method: "POST",
        body: JSON.stringify({ email: parsed.data.email }),
      },
    );

    return NextResponse.json({
      ok: true,
      resetLink:
        process.env.NODE_ENV === "production" ? undefined : response.resetLink,
      message:
        "Si un compte existe avec cet email, un lien de reinitialisation a ete envoye.",
    });
  } catch {
    return NextResponse.json({
      ok: true,
      message:
        "Si un compte existe avec cet email, un lien de reinitialisation a ete envoye.",
    });
  }
}
