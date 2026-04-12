import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { cloudflareApi } from "@/lib/cloudflare-api";

export async function POST() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  try {
    const response = await cloudflareApi<{ ok: boolean; verifyLink?: string }>(
      "/v1/auth/verify-email/request",
      {
        method: "POST",
        body: JSON.stringify({ email: session.email }),
      },
    );

    return NextResponse.json({
      ok: true,
      verifyLink:
        process.env.NODE_ENV === "production" ? undefined : response.verifyLink,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Impossible d'envoyer la verification",
      },
      { status: 400 },
    );
  }
}
