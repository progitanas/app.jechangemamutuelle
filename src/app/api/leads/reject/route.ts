import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { leadRejectSchema } from "@/lib/schemas";
import { cloudflareApi } from "@/lib/cloudflare-api";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = leadRejectSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Payload invalide" }, { status: 400 });
  }

  try {
    const response = await cloudflareApi<{ ok: boolean }>("/v1/leads/reject", {
      method: "POST",
      body: JSON.stringify({
        leadId: parsed.data.leadId,
        reason: parsed.data.reason,
        details: parsed.data.details || null,
        userId: session.userId,
      }),
    });

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Erreur reject lead Cloudflare",
      },
      { status: 500 },
    );
  }
}
