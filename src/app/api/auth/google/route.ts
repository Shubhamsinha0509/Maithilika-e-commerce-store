import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { googleConfig, safeReturnPath } from "@/lib/customer-auth";

/** Sends the customer to Google. `state` ties the answer to this browser, against forged sign-ins. */
export async function GET(request: NextRequest) {
  const next = safeReturnPath(request.nextUrl.searchParams.get("next"));
  const cfg = googleConfig();
  if (!cfg) return NextResponse.redirect(new URL(`${next}?signin=failed`, request.nextUrl.origin));

  const state = randomBytes(24).toString("hex");
  (await cookies()).set("mth_oauth", `${state}.${next}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/auth/google",
    maxAge: 10 * 60,
  });

  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.search = new URLSearchParams({
    client_id: cfg.clientId,
    redirect_uri: `${request.nextUrl.origin}/api/auth/google/callback`,
    response_type: "code",
    scope: "openid email profile",
    state,
    prompt: "select_account",
  }).toString();
  return NextResponse.redirect(url);
}
