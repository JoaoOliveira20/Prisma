import { cookies } from "next/headers";

const TOKEN_COOKIE = "prisma_token";
const THIRTY_DAYS = 60 * 60 * 24 * 30;

export async function getToken() {
  return (await cookies()).get(TOKEN_COOKIE)?.value;
}

export async function setToken(token: string) {
  (await cookies()).set(TOKEN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: THIRTY_DAYS,
  });
}

export async function clearToken() {
  (await cookies()).delete(TOKEN_COOKIE);
}
