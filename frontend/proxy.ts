import { NextResponse, type NextRequest } from "next/server";
import { REFRESH_AFTER_MS, REFRESHED_COOKIE, sessionCookieOptions, TOKEN_COOKIE } from "@/lib/session-cookies";

const API_URL = process.env.API_URL ?? "http://localhost:8000/api";

function toLogin(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/login", request.url));
  response.cookies.delete(TOKEN_COOKIE);
  response.cookies.delete(REFRESHED_COOKIE);
  return response;
}

export async function proxy(request: NextRequest) {
  const token = request.cookies.get(TOKEN_COOKIE)?.value;

  if (!token) {
    return toLogin(request);
  }

  const isPrefetch = request.headers.has("next-router-prefetch") || request.headers.get("purpose") === "prefetch";
  const refreshedAt = Number(request.cookies.get(REFRESHED_COOKIE)?.value ?? 0);

  if (isPrefetch || Date.now() - refreshedAt < REFRESH_AFTER_MS) {
    return NextResponse.next();
  }

  try {
    const refresh = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      cache: "no-store",
      headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
    });

    if (refresh.status === 401) {
      return toLogin(request);
    }

    if (refresh.ok) {
      const { expires_in: expiresIn } = await refresh.json();
      const response = NextResponse.next();
      response.cookies.set(TOKEN_COOKIE, token, sessionCookieOptions(expiresIn));
      response.cookies.set(REFRESHED_COOKIE, String(Date.now()), sessionCookieOptions(expiresIn));
      return response;
    }
  } catch {}

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!login|_next/static|_next/image|images|favicon.ico|icon.svg|apple-icon.png).*)"],
};
