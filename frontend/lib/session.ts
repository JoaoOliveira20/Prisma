import { cookies } from "next/headers";
import { REFRESHED_COOKIE, sessionCookieOptions, TOKEN_COOKIE } from "./session-cookies";

export async function getToken() {
  return (await cookies()).get(TOKEN_COOKIE)?.value;
}

export async function setToken(token: string, expiresIn: number) {
  const store = await cookies();
  store.set(TOKEN_COOKIE, token, sessionCookieOptions(expiresIn));
  store.set(REFRESHED_COOKIE, String(Date.now()), sessionCookieOptions(expiresIn));
}

export async function clearToken() {
  const store = await cookies();
  store.delete(TOKEN_COOKIE);
  store.delete(REFRESHED_COOKIE);
}
