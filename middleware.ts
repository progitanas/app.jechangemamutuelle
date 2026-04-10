import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const PUBLIC_ROUTES = ["/", "/login", "/register"];

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

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/stripe/webhook") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  if (PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.next();
  }

  const token = req.cookies.get("jmm_session")?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    const { payload } = await jwtVerify(token, secret);
    const role = payload.role as string;

    if (pathname.startsWith("/admin") && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
