import { createHmac, timingSafeEqual } from "node:crypto";
import { serverEnv } from "@/env";

/**
 * Minimal Razorpay client: create an order, verify signatures. Uses the REST
 * API directly rather than the SDK, to avoid a dependency for two calls.
 * Server-only — the secret must never reach the browser.
 */

/** True when checkout can take payment. Read at build time by the layout. */
export function paymentsEnabled() {
  return Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
}

function keys() {
  const { RAZORPAY_KEY_ID: keyId, RAZORPAY_KEY_SECRET: keySecret } = serverEnv();
  if (!keyId || !keySecret) throw new Error("Razorpay keys are not configured");
  return { keyId, keySecret };
}

export async function createRazorpayOrder(amountPaise: number, receipt: string) {
  const { keyId, keySecret } = keys();
  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Basic " + Buffer.from(`${keyId}:${keySecret}`).toString("base64"),
    },
    body: JSON.stringify({ amount: amountPaise, currency: "INR", receipt }),
    cache: "no-store",
  });
  if (!res.ok) {
    // Log status only: the body can echo request details.
    console.error(`Razorpay order creation failed: HTTP ${res.status}`);
    throw new Error("Could not start the payment");
  }
  const data = (await res.json()) as { id: string; amount: number };
  return { orderId: data.id, amount: data.amount, keyId };
}

function hmacMatches(payload: string, secret: string, signature: string | null) {
  if (!signature) return false;
  const expected = createHmac("sha256", secret).update(payload).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** The checkout popup's success callback: HMAC of "order_id|payment_id". */
export function verifyPaymentSignature(orderId: string, paymentId: string, signature: string) {
  return hmacMatches(`${orderId}|${paymentId}`, keys().keySecret, signature);
}

/** Webhooks: HMAC of the raw request body with the webhook secret. */
export function verifyWebhookSignature(rawBody: string, signature: string | null) {
  const secret = serverEnv().RAZORPAY_WEBHOOK_SECRET;
  if (!secret) return false;
  return hmacMatches(rawBody, secret, signature);
}
