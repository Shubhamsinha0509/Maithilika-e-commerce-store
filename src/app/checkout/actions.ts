"use server";

import { checkoutSchema, type CheckoutInput, type FieldErrors } from "@/lib/checkout";
import { markPaid, placeOrder, type PlaceOrderResult } from "@/lib/orders";
import { paymentsEnabled, verifyPaymentSignature } from "@/lib/razorpay";

export type StartCheckoutResult = PlaceOrderResult | { ok: false; error: string; fieldErrors: FieldErrors };

export async function startCheckout(input: CheckoutInput): Promise<StartCheckoutResult> {
  if (!paymentsEnabled()) return { ok: false, error: "Online payments are not open yet." };

  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: FieldErrors = {};
    for (const issue of parsed.error.issues) {
      const field = String(issue.path[0] ?? "form");
      fieldErrors[field] ??= issue.message;
    }
    return { ok: false, error: "Please check the highlighted details.", fieldErrors };
  }
  return placeOrder(parsed.data);
}

export type ConfirmPaymentResult =
  | { ok: true; orderNumber: string; soldToSomeoneElse: string[] }
  | { ok: false; error: string };

/** The Razorpay popup's success callback. The webhook is the backstop. */
export async function confirmPayment(payment: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}): Promise<ConfirmPaymentResult> {
  const { razorpay_order_id: orderId, razorpay_payment_id: paymentId, razorpay_signature: signature } = payment;
  if (typeof orderId !== "string" || typeof paymentId !== "string" || typeof signature !== "string" || !verifyPaymentSignature(orderId, paymentId, signature)) {
    return { ok: false, error: "We couldn't verify this payment." };
  }

  const result = await markPaid(orderId, paymentId);
  switch (result.status) {
    case "paid":
      return { ok: true, orderNumber: result.orderNumber, soldToSomeoneElse: result.soldToSomeoneElse };
    case "already-paid":
      return { ok: true, orderNumber: result.orderNumber, soldToSomeoneElse: [] };
    default:
      return { ok: false, error: "We couldn't match this payment to an order." };
  }
}
