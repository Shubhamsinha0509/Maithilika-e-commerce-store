import { randomInt } from "node:crypto";
import { revalidateTag } from "next/cache";
import { after } from "next/server";
import { Prisma } from "@/generated/prisma/client";
import { sendOrderConfirmation } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { createRazorpayOrder } from "@/lib/razorpay";
import { inr, shippingFor } from "@/lib/store";
import type { z } from "zod";
import type { checkoutSchema } from "@/lib/checkout";

/** What an Order stores in its `items` JSON column. Prices in rupees. */
export type OrderItem = {
  productId: string;
  name: string;
  optionLabel: string | null;
  option: string | null;
  price: number;
  qty: number;
  madeToOrder: boolean;
};

type ValidCheckout = z.output<typeof checkoutSchema>;

export type PlaceOrderResult =
  | { ok: true; orderNumber: string; razorpay: { keyId: string; orderId: string; amount: number } }
  | { ok: false; error: string; soldIds?: string[]; prices?: Record<string, number> };

// No 0/O or 1/I, so a number read over the phone is unambiguous.
const ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
function newOrderNumber() {
  let s = "MTH-";
  for (let i = 0; i < 8; i++) s += ALPHABET[randomInt(ALPHABET.length)];
  return s;
}

/**
 * Prices, availability and options all come from the database; the browser
 * only says which products and options it wants.
 */
export async function placeOrder(input: ValidCheckout): Promise<PlaceOrderResult> {
  const products = await prisma.product.findMany({ where: { id: { in: input.lines.map((l) => l.id) } } });
  const byId = new Map(products.map((p) => [p.id, p]));

  // Merge repeated lines. Made-to-order lines merge per option; a one-of-a-kind
  // piece is a single line whatever options were picked (the first one wins),
  // so it can never be charged twice.
  const wanted = new Map<string, { id: string; option: string | null; qty: number }>();
  for (const l of input.lines) {
    const madeToOrder = byId.get(l.id)?.madeToOrder ?? false;
    const key = madeToOrder ? `${l.id}|${l.option ?? ""}` : l.id;
    const prev = wanted.get(key);
    if (prev && !madeToOrder) continue;
    wanted.set(key, { ...l, qty: (prev?.qty ?? 0) + l.qty });
  }

  const items: OrderItem[] = [];
  const soldIds: string[] = [];
  for (const l of wanted.values()) {
    const p = byId.get(l.id);
    if (!p || p.hidden) return { ok: false, error: "A piece in your bag is no longer available. Please remove it and try again." };
    if (!p.madeToOrder && p.sold) {
      soldIds.push(p.id);
      continue;
    }
    const option = p.options.length ? l.option : null;
    if (p.options.length && (!option || !p.options.includes(option))) {
      return { ok: false, error: `Please choose a ${p.optionLabel?.toLowerCase() ?? "option"} for ${p.name}.` };
    }
    items.push({
      productId: p.id,
      name: p.name,
      optionLabel: p.optionLabel,
      option,
      price: p.price,
      // A one-of-a-kind piece can only be bought once.
      qty: p.madeToOrder ? Math.min(l.qty, 10) : 1,
      madeToOrder: p.madeToOrder,
    });
  }
  if (soldIds.length) {
    return { ok: false, error: "Sorry, a one-of-a-kind piece in your bag has just been sold.", soldIds };
  }

  const subtotal = items.reduce((n, i) => n + i.price * i.qty, 0);
  const shipping = shippingFor(subtotal);
  const total = subtotal + shipping;

  // The bag shows prices saved when each piece was added. If any changed
  // since, stop before creating anything so the customer sees the new total.
  if (total !== input.expectedTotal) {
    return {
      ok: false,
      error: `Prices have changed since you added these pieces. Your total is now ${inr(total)}. Please check your order and pay again.`,
      prices: Object.fromEntries(items.map((i) => [i.productId, i.price])),
    };
  }

  const data = {
    name: input.name,
    email: input.email,
    phone: input.phone,
    addressLine1: input.addressLine1,
    addressLine2: input.addressLine2,
    city: input.city,
    state: input.state,
    pincode: input.pincode,
    items,
    subtotal,
    shipping,
    total,
  };

  let order;
  for (let attempt = 0; !order; attempt++) {
    try {
      order = await prisma.order.create({ data: { ...data, orderNumber: newOrderNumber() } });
    } catch (e) {
      // An order-number collision is astronomically rare; retry a couple of times.
      const collision = e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002";
      if (!collision || attempt >= 2) throw e;
    }
  }

  try {
    const rp = await createRazorpayOrder(total * 100, order.orderNumber);
    await prisma.order.update({ where: { id: order.id }, data: { razorpayOrderId: rp.orderId } });
    return { ok: true, orderNumber: order.orderNumber, razorpay: rp };
  } catch {
    await prisma.order.update({ where: { id: order.id }, data: { status: "CANCELLED", note: "Payment could not be started (Razorpay order creation failed)." } });
    return { ok: false, error: "We couldn't start the payment. Please try again in a minute." };
  }
}

export type MarkPaidResult =
  | { status: "paid"; orderNumber: string; soldToSomeoneElse: string[] }
  | { status: "already-paid"; orderNumber: string }
  | { status: "unknown-order" };

/**
 * Called by both the checkout callback and the Razorpay webhook, in either
 * order and possibly at the same time. Only the first call changes anything:
 * the update is conditional on the order never having been paid (paidAt is
 * null), so a second call matches no row and returns "already-paid".
 *
 * Money that arrived is always recorded, even on an order the owner had
 * cancelled while it was unpaid; anything unusual goes in the order's note.
 */
export async function markPaid(razorpayOrderId: string, razorpayPaymentId: string, amountPaise?: number): Promise<MarkPaidResult> {
  const result = await prisma.$transaction(async (tx): Promise<MarkPaidResult> => {
    const order = await tx.order.findUnique({ where: { razorpayOrderId } });
    if (!order) return { status: "unknown-order" };

    const claimed = await tx.order.updateMany({
      where: { id: order.id, paidAt: null },
      data: { status: "PAID", razorpayPaymentId, paidAt: new Date() },
    });
    if (claimed.count === 0) return { status: "already-paid", orderNumber: order.orderNumber };

    const notes: string[] = [];
    if (order.status === "CANCELLED") notes.push("The payment arrived after this order was cancelled, so it is marked paid again.");
    if (amountPaise !== undefined && amountPaise !== order.total * 100) {
      notes.push(`Razorpay reported ₹${amountPaise / 100} paid, but the order total is ₹${order.total}. Check before shipping.`);
    }

    // Mark one-of-a-kind pieces sold. If someone else's payment got there
    // first, keep this order paid and tell the owner to refund (docs/plan.md).
    const soldToSomeoneElse: string[] = [];
    for (const item of order.items as unknown as OrderItem[]) {
      if (item.madeToOrder) continue;
      const updated = await tx.product.updateMany({ where: { id: item.productId, sold: false }, data: { sold: true } });
      if (updated.count === 0) soldToSomeoneElse.push(item.name);
    }
    if (soldToSomeoneElse.length) {
      notes.push(`Paid, but already sold to another customer: ${soldToSomeoneElse.join(", ")}. Refund this from the Razorpay dashboard and tell the customer.`);
    }
    if (notes.length) {
      await tx.order.update({ where: { id: order.id }, data: { note: [order.note, ...notes].filter(Boolean).join(" ") } });
    }
    return { status: "paid", orderNumber: order.orderNumber, soldToSomeoneElse };
    // Prisma waits only 2s for a connection by default. That is too short when
    // the database is waking from idle, and this is the step a payment needs.
  }, { maxWait: 10_000, timeout: 15_000 });

  if (result.status === "paid") {
    revalidateTag("products", { expire: 0 });
    // Only the first call reaches here, so the customer gets one email. It runs
    // after the response, so email trouble can never affect the payment. If a
    // piece went to someone else, the owner refunds and explains instead.
    if (result.soldToSomeoneElse.length === 0) after(() => emailConfirmation(razorpayOrderId));
  }
  return result;
}

async function emailConfirmation(razorpayOrderId: string) {
  try {
    const order = await prisma.order.findUnique({ where: { razorpayOrderId } });
    if (!order) return;
    const sent = await sendOrderConfirmation({ ...order, items: order.items as unknown as OrderItem[] });
    if (sent === "failed") {
      const note = [order.note, "The confirmation email could not be sent to the customer."].filter(Boolean).join(" ");
      await prisma.order.update({ where: { id: order.id }, data: { note } });
    }
  } catch (e) {
    console.error("Confirmation email step failed", e);
  }
}

export async function findOrder(orderNumber: string, email: string) {
  return prisma.order.findFirst({
    where: { orderNumber: orderNumber.trim().toUpperCase(), email: email.trim().toLowerCase() },
  });
}
