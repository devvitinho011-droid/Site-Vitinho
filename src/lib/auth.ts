import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

// Login do painel: uma senha só (ADMIN_PASSWORD nas variáveis de ambiente).
// O cookie guarda uma assinatura da senha, nunca a senha em si; trocar a senha na Vercel desloga todo mundo.
export const COOKIE = "links_admin";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 dias

function token() {
  const pass = process.env.ADMIN_PASSWORD;
  if (!pass) return null;
  return createHmac("sha256", pass).update("links-admin-v1").digest("hex");
}

function same(a: string, b: string) {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export function checkPassword(input: string) {
  const pass = process.env.ADMIN_PASSWORD;
  return !!pass && same(input, pass);
}

export async function isLoggedIn() {
  const t = token();
  const c = (await cookies()).get(COOKIE)?.value;
  return !!t && !!c && same(c, t);
}

export async function startSession() {
  (await cookies()).set(COOKIE, token()!, {
    httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: MAX_AGE,
  });
}

export async function endSession() {
  (await cookies()).delete(COOKIE);
}
