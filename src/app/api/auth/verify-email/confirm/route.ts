import { NextResponse } from "next/server";
import { z } from "zod";
import { cloudflareApi } from "@/lib/cloudflare-api";

const confirmSchema = z.object({
  token: z.string().min(20),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const parsed = confirmSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Token invalide" }, { status: 400 });
  }

  try {
    await cloudflareApi("/v1/auth/verify-email/confirm", {
      method: "POST",
      body: JSON.stringify({ token: parsed.data.token }),
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Verification impossible",
      },
      { status: 400 },
    );
  }
}
