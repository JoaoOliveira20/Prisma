export const TOKEN_COOKIE = "prisma_token";
export const REFRESHED_COOKIE = "prisma_session_refreshed_at";
export const REFRESH_AFTER_MS = 60 * 60 * 1000;

export const sessionCookieOptions = (maxAge: number) => ({
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge,
});
