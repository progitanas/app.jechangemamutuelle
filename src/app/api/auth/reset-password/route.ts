import { NextResponse } from "next/server";
import { z } from "zod";
import { cloudflareApi } from "@/lib/cloudflare-api";

const resetSchema = z.object({
  token: z.string().min(20),
  newPassword: z.string().min(10),
  confirmPassword: z.string().min(10),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const parsed = resetSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Données invalides" }, { status: 400 });
  }

  if (parsed.data.newPassword !== parsed.data.confirmPassword) {
    return NextResponse.json(
      { error: "La confirmation ne correspond pas" },
      { status: 400 },
    );
  }

  try {
    await cloudflareApi("/v1/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({
        token: parsed.data.token,
        newPassword: parsed.data.newPassword,
      }),
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Reinitialisation impossible",
      },
      { status: 400 },
    );
  }
}
