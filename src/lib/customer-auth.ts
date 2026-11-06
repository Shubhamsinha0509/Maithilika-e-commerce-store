import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { serverEnv } from "@/env";
import { prisma } from "@/lib/prisma";

/** A signed cookie naming the customer, like the admin session in admin-auth.ts. */
const COOKIE = "mth_customer";
const SESSION_DAYS = 30;

export function googleConfig() {
  const { GOOGLE_CLIENT_ID: clientId, GOOGLE_CLIENT_SECRET: clientSecret, CUSTOMER_SESSION_SECRET: sessionSecret } = serverEnv();
  return clientId && clientSecret && sessionSecret ? { clientId, clientSecret, sessionSecret } : null;
}

export const signInEnabled = () => googleConfig() !== null;

/** Sign-in only ever returns to these pages, so a crafted link can't send someone elsewhere. */
const RETURN_PAGES = ["/custom-order", "/account", "/checkout"];
export const safeReturnPath = (path: string | null) => (path && RETURN_PAGES.includes(path) ? path : "/account");

const sign = (value: string, secret: string) => createHmac("sha256", secret).update(value).digest("hex");

export async function startCustomerSession(customerId: string) {
  const cfg = googleConfig();
  if (!cfg) throw new Error("Google sign-in is not configured");
  const expiry = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000;
  const value = `${customerId}.${expiry}`;
  (await cookies()).set(COOKIE, `${value}.${sign(value, cfg.sessionSecret)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(expiry),
  });
}

export async function endCustomerSession() {
  (await cookies()).delete(COOKIE);
}

/** The signed-in customer, or null. Always per-request, so it stays out of prerendering. */
export async function currentCustomer() {
  await connection();
  const cfg = googleConfig();
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!cfg || !raw) return null;
  const [id, expiryText, signature] = raw.split(".");
  if (!id || !expiryText || !signature) return null;
  const expected = Buffer.from(sign(`${id}.${expiryText}`, cfg.sessionSecret));
  const given = Buffer.from(signature);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  const expiry = Number(expiryText);
  if (!Number.isFinite(expiry) || expiry <= Date.now()) return null;
  return prisma.customer.findUnique({ where: { id } });
}
