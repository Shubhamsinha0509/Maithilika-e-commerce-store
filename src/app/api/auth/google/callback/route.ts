import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { googleConfig, safeReturnPath, startCustomerSession } from "@/lib/customer-auth";
import { prisma } from "@/lib/prisma";

const googleProfile = z.object({
  iss: z.enum(["https://accounts.google.com", "accounts.google.com"]),
  aud: z.string(),
  exp: z.number(),
  sub: z.string().min(1),
  email: z.email(),
  email_verified: z.literal(true),
  name: z.string().trim().min(1).max(100).optional(),
});

/** Google sends the customer back here with a one-time code, which we swap for who they are. */
export async function GET(request: NextRequest) {
  const { origin, searchParams } = request.nextUrl;
  const jar = await cookies();
  const [expectedState, savedNext] = (jar.get("mth_oauth")?.value ?? "").split(".");
  jar.delete({ name: "mth_oauth", path: "/api/auth/google" });
  const next = safeReturnPath(savedNext ?? null);
  const failed = () => NextResponse.redirect(new URL(`${next}?signin=failed`, origin));

  const cfg = googleConfig();
  const code = searchParams.get("code");
  if (!cfg || !code || !expectedState || searchParams.get("state") !== expectedState) return failed();

  try {
    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: cfg.clientId,
        client_secret: cfg.clientSecret,
        redirect_uri: `${origin}/api/auth/google/callback`,
        grant_type: "authorization_code",
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) throw new Error(`Google token exchange failed: ${res.status}`);

    // This came straight from Google over HTTPS, so its signature needn't be
    // checked again (OpenID Connect Core 3.1.3.7); its claims still are.
    const { id_token: idToken } = (await res.json()) as { id_token?: string };
    const claims = JSON.parse(Buffer.from(String(idToken).split(".")[1], "base64url").toString());
    const profile = googleProfile.parse(claims);
    if (profile.aud !== cfg.clientId || profile.exp * 1000 <= Date.now()) throw new Error("Google token is not for this site");

    const customer = await prisma.customer.upsert({
      where: { googleId: profile.sub },
      // The name is only a starting point: it's theirs to edit on the profile.
      create: { googleId: profile.sub, email: profile.email, name: profile.name ?? profile.email.split("@")[0] },
      update: { email: profile.email },
    });
    await startCustomerSession(customer.id);
    return NextResponse.redirect(new URL(next, origin));
  } catch (e) {
    console.error("Google sign-in failed", e);
    return failed();
  }
}
