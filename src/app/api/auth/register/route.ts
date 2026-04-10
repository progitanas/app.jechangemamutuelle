import { NextResponse } from "next/server";
import { createSession } from "@/lib/auth";
import { registerSchema } from "@/lib/schemas";
import { cloudflareApi } from "@/lib/cloudflare-api";

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Données invalides" }, { status: 400 });
  }

  let response: {
    user: {
      id: string;
      email: string;
      role: "USER" | "ADMIN";
      firstName: string;
      lastName: string;
    };
  };

  try {
    response = await cloudflareApi("/v1/auth/register", {
      method: "POST",
      body: JSON.stringify(parsed.data),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erreur register";
    const upstreamUnavailable =
      message.includes("timeout") ||
      message.includes("unreachable") ||
      message.includes("configured");

    return NextResponse.json(
      { error: message },
      { status: upstreamUnavailable ? 502 : 400 },
    );
  }

  await createSession({
    userId: response.user.id,
    role: response.user.role,
    email: response.user.email,
    firstName: response.user.firstName,
    lastName: response.user.lastName,
  });

  return NextResponse.json({ ok: true });
}
