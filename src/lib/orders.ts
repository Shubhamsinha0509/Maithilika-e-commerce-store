import { randomInt } from "node:crypto";
import { revalidateTag } from "next/cache";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { createRazorpayOrder } from "@/lib/razorpay";
import { shippingFor } from "@/lib/store";
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
  | { ok: false; error: string; soldIds?: string[] };

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
  // Merge repeated lines for the same product and option.
  const wanted = new Map<string, { id: string; option: string | null; qty: number }>();
  for (const l of input.lines) {
    const key = `${l.id}|${l.option ?? ""}`;
    const prev = wanted.get(key);
    wanted.set(key, { ...l, qty: (prev?.qty ?? 0) + l.qty });
  }

  const products = await prisma.product.findMany({ where: { id: { in: [...wanted.values()].map((l) => l.id) } } });
  const byId = new Map(products.map((p) => [p.id, p]));

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
  | { status: "unknown-order" }
  | { status: "amount-mismatch"; orderNumber: string };

/**
 * Called by both the checkout callback and the Razorpay webhook, in either
 * order and possibly at the same time. Only the first call changes anything:
 * the status update is conditional on PENDING_PAYMENT, so a second call
 * matches no row and returns "already-paid".
 */
export async function markPaid(razorpayOrderId: string, razorpayPaymentId: string, amountPaise?: number): Promise<MarkPaidResult> {
  const result = await prisma.$transaction(async (tx): Promise<MarkPaidResult> => {
    const order = await tx.order.findUnique({ where: { razorpayOrderId } });
    if (!order) return { status: "unknown-order" };
    if (amountPaise !== undefined && amountPaise !== order.total * 100) {
      await tx.order.update({ where: { id: order.id }, data: { note: `Razorpay reported ₹${amountPaise / 100} paid, but the order total is ₹${order.total}. Check before shipping.` } });
      return { status: "amount-mismatch", orderNumber: order.orderNumber };
    }

    const claimed = await tx.order.updateMany({
      where: { id: order.id, status: "PENDING_PAYMENT" },
      data: { status: "PAID", razorpayPaymentId, paidAt: new Date() },
    });
    if (claimed.count === 0) return { status: "already-paid", orderNumber: order.orderNumber };

    // Mark one-of-a-kind pieces sold. If someone else's payment got there
    // first, keep this order paid and tell the owner to refund (docs/plan.md).
    const soldToSomeoneElse: string[] = [];
    for (const item of order.items as unknown as OrderItem[]) {
      if (item.madeToOrder) continue;
      const updated = await tx.product.updateMany({ where: { id: item.productId, sold: false }, data: { sold: true } });
      if (updated.count === 0) soldToSomeoneElse.push(item.name);
    }
    if (soldToSomeoneElse.length) {
      await tx.order.update({
        where: { id: order.id },
        data: { note: `Paid, but already sold to another customer: ${soldToSomeoneElse.join(", ")}. Refund this from the Razorpay dashboard and tell the customer.` },
      });
    }
    return { status: "paid", orderNumber: order.orderNumber, soldToSomeoneElse };
  });

  if (result.status === "paid") revalidateTag("products", { expire: 0 });
  return result;
}

export async function findOrder(orderNumber: string, email: string) {
  return prisma.order.findFirst({
    where: { orderNumber: orderNumber.trim().toUpperCase(), email: email.trim().toLowerCase() },
  });
}
