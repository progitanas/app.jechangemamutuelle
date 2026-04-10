import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { cache } from "react";
import { UserRole } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

const COOKIE_NAME = "jmm_session";

function getAuthSecret() {
  const authSecret = process.env.AUTH_SECRET;
  if (!authSecret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("AUTH_SECRET must be defined in production");
    }

    return "dev_secret_change_me";
  }

  return authSecret;
}

const secret = new TextEncoder().encode(getAuthSecret());

export type SessionPayload = {
  userId: string;
  role: UserRole;
  email: string;
};

export async function createSession(payload: SessionPayload) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);

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
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secret);
    return {
      userId: payload.userId as string,
      role: payload.role as UserRole,
      email: payload.email as string,
    };
  } catch {
    return null;
  }
}

export const getCurrentUser = cache(async () => {
  const session = await getSession();
  if (!session) return null;

  return prisma.user.findUnique({
    where: { id: session.userId },
  });
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
