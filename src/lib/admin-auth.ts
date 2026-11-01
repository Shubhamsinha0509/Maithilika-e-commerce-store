import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { serverEnv } from "@/env";

/**
 * One shared admin password (ADMIN_PASSWORD) and a signed session cookie.
 * The signature covers the expiry and a hash of the password, so changing
 * the password signs everyone out.
 */
const COOKIE = "mth_admin";
const SESSION_DAYS = 7;

function config() {
  const { ADMIN_PASSWORD: password, ADMIN_SESSION_SECRET: secret } = serverEnv();
  return password && secret ? { password, secret } : null;
}

export const adminConfigured = () => config() !== null;

const sha256 = (s: string) => createHash("sha256").update(s).digest();

function sign(expiry: number, cfg: { password: string; secret: string }) {
  return createHmac("sha256", cfg.secret).update(`${expiry}.${sha256(cfg.password).toString("hex")}`).digest("hex");
}

function safeEqual(a: string | Buffer, b: string | Buffer) {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export function passwordMatches(attempt: string) {
  const cfg = config();
  // Compare hashes so the comparison takes the same time whatever the length.
  return cfg !== null && safeEqual(sha256(attempt), sha256(cfg.password));
}

export async function startSession() {
  const cfg = config();
  if (!cfg) throw new Error("Admin is not configured");
  const expiry = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000;
  (await cookies()).set(COOKIE, `${expiry}.${sign(expiry, cfg)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(expiry),
  });
}

export async function endSession() {
  (await cookies()).delete(COOKIE);
}

export async function isAdmin() {
  // A session check is always per-request; this keeps it out of prerendering
  // (Date.now() below would otherwise be flagged).
  await connection();
  const cfg = config();
  const value = (await cookies()).get(COOKIE)?.value;
  if (!cfg || !value) return false;
  const [expiryText, signature] = value.split(".");
  const expiry = Number(expiryText);
  return Number.isFinite(expiry) && expiry > Date.now() && !!signature && safeEqual(signature, sign(expiry, cfg));
}

/** Call first in every admin page and admin action. */
export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin/login");
}
