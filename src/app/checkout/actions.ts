"use server";

import { checkoutSchema, type CheckoutInput, type FieldErrors } from "@/lib/checkout";
import { markPaid, placeOrder, type PlaceOrderResult } from "@/lib/orders";
import { currentCustomer } from "@/lib/customer-auth";
import { prisma } from "@/lib/prisma";
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
  // Signed in: remember this address (and the number, if the profile has none)
  // for next time. Never let this stop the order.
  const customer = await currentCustomer().catch(() => null);
  if (customer) {
    const { addressLine1, addressLine2, city, state, pincode, phone } = parsed.data;
    await prisma.customer
      .update({ where: { id: customer.id }, data: { addressLine1, addressLine2, city, state, pincode, phone: customer.phone ?? phone } })
      .catch((e) => console.error("Could not save the address to the profile", e));
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
