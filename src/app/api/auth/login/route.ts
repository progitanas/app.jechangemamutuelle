import { NextResponse } from "next/server";
import { createSession } from "@/lib/auth";
import { loginSchema } from "@/lib/schemas";
import { cloudflareApi } from "@/lib/cloudflare-api";

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = loginSchema.safeParse(body);

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
      phone?: string | null;
      city?: string | null;
    };
  };

  try {
    response = await cloudflareApi("/v1/auth/login", {
      method: "POST",
      body: JSON.stringify(parsed.data),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur login";
    const statusMatch = message.match(/^\[(\d{3})\]\s*(.*)$/);
    const upstreamStatus = statusMatch ? Number(statusMatch[1]) : null;
    const cleanMessage = statusMatch?.[2] || message;
    const upstreamUnavailable =
      message.includes("timeout") ||
      message.includes("unreachable") ||
      message.includes("configured");

    return NextResponse.json(
      { error: cleanMessage },
      {
        status: upstreamUnavailable
          ? 502
          : upstreamStatus === 401
            ? 401
            : upstreamStatus && upstreamStatus >= 500
              ? 502
              : 400,
      },
    );
  }

  try {
    await createSession({
      userId: response.user.id,
      role: response.user.role,
      email: response.user.email,
      firstName: response.user.firstName,
      lastName: response.user.lastName,
      phone: response.user.phone || null,
      city: response.user.city || null,
    });
  } catch (error) {
    const message =
      error instanceof Error && error.message.includes("AUTH_SECRET")
        ? "AUTH_SECRET non configuré en production"
        : "Erreur session";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    redirectTo: response.user.role === "ADMIN" ? "/admin" : "/dashboard",
  });
}
