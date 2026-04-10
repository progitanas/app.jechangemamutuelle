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
  } catch {
    return NextResponse.json(
      { error: "Identifiants invalides" },
      { status: 401 },
    );
  }

  await createSession({
    userId: response.user.id,
    role: response.user.role,
    email: response.user.email,
    firstName: response.user.firstName,
    lastName: response.user.lastName,
    phone: response.user.phone || null,
    city: response.user.city || null,
  });

  return NextResponse.json({
    ok: true,
    redirectTo: response.user.role === "ADMIN" ? "/admin" : "/dashboard",
  });
}
