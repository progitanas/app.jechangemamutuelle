import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { cache } from "react";

const COOKIE_NAME = "jmm_session";

function getAuthSecret(allowMissingInProduction = false) {
  const authSecret = process.env.AUTH_SECRET;
  if (!authSecret) {
    if (process.env.NODE_ENV === "production" && !allowMissingInProduction) {
      throw new Error("AUTH_SECRET must be defined in production");
    }

    if (process.env.NODE_ENV === "production") {
      return null;
    }

    return "dev_secret_change_me";
  }

  return authSecret;
}

export type SessionPayload = {
  userId: string;
  role: "USER" | "ADMIN";
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string | null;
  city?: string | null;
};

export async function createSession(payload: SessionPayload) {
  const signingSecret = getAuthSecret(false);
  if (!signingSecret) {
    throw new Error("AUTH_SECRET must be defined in production");
  }

  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(new TextEncoder().encode(signingSecret));

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getSession(): Promise<SessionPayload | null> {
  const authSecret = getAuthSecret(true);
  if (!authSecret) return null;

  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(authSecret),
    );
    return {
      userId: payload.userId as string,
      role: payload.role as "USER" | "ADMIN",
      email: payload.email as string,
      firstName: payload.firstName as string | undefined,
      lastName: payload.lastName as string | undefined,
      phone: (payload.phone as string | null | undefined) ?? null,
      city: (payload.city as string | null | undefined) ?? null,
    };
  } catch {
    return null;
  }
}

export const getCurrentUser = cache(async () => {
  const session = await getSession();
  if (!session) return null;

  return {
    id: session.userId,
    role: session.role,
    email: session.email,
    firstName: session.firstName || "",
    lastName: session.lastName || "",
    phone: session.phone || null,
    city: session.city || null,
  };
});

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHORIZED");
  return user;
}

export async function requireAdmin() {
  const user = await requireAuth();
  if (user.role !== "ADMIN") throw new Error("FORBIDDEN");
  return user;
}
