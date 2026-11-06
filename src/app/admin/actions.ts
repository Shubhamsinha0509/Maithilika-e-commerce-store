"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { adminConfigured, endSession, passwordMatches, requireAdmin, startSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export async function login(_prev: string | null, form: FormData): Promise<string | null> {
  if (!adminConfigured()) {
    return "Admin isn't set up yet. Add ADMIN_PASSWORD and ADMIN_SESSION_SECRET to the environment variables.";
  }
  const password = String(form.get("password") ?? "");
  if (!passwordMatches(password)) {
    // Slow down guessing a little.
    await new Promise((r) => setTimeout(r, 800));
    return "That password is not right.";
  }
  await startSession();
  redirect("/admin");
}

export async function logout() {
  await endSession();
  redirect("/admin/login");
}

const orderUpdate = z.object({
  orderNumber: z.string().min(1).max(40),
  status: z.enum(["PAID", "SHIPPED", "DELIVERED", "CANCELLED"]),
  trackingUrl: z
    .string()
    .trim()
    .max(500)
    .refine((v) => v === "" || /^https?:\/\//i.test(v), "Tracking link must start with http:// or https://")
    .transform((v) => v || null),
  note: z.string().trim().max(2000).transform((v) => v || null),
});

export async function updateOrder(form: FormData) {
  await requireAdmin();
  const parsed = orderUpdate.safeParse(Object.fromEntries(form));
  if (!parsed.success) redirect(`/admin/orders/${encodeURIComponent(String(form.get("orderNumber")))}?error=${encodeURIComponent(parsed.error.issues[0].message)}`);
  const { orderNumber, status, trackingUrl, note } = parsed.data;

  const order = await prisma.order.findUnique({ where: { orderNumber } });
  if (!order) redirect("/admin");
  // An order that was never paid (pending, or cancelled before payment) can
  // only be cancelled. Only a real payment can make it paid.
  if (order.paidAt === null && status !== "CANCELLED") {
    redirect(`/admin/orders/${orderNumber}?error=${encodeURIComponent("This order was never paid. It can only be cancelled.")}`);
  }

  await prisma.order.update({ where: { orderNumber }, data: { status, trackingUrl, note } });
  redirect(`/admin/orders/${orderNumber}?saved=1`);
}

const orderRef = z.object({ orderNumber: z.string().min(1).max(40) });

export async function cancelUnpaidOrder(form: FormData) {
  await requireAdmin();
  const parsed = orderRef.safeParse(Object.fromEntries(form));
  if (!parsed.success) redirect("/admin");
  const { orderNumber } = parsed.data;
  await prisma.order.updateMany({ where: { orderNumber, status: "PENDING_PAYMENT", paidAt: null }, data: { status: "CANCELLED" } });
  redirect(`/admin/orders/${encodeURIComponent(orderNumber)}?saved=1`);
}

const requestRef = z.object({ id: z.string().min(1).max(40) });

export async function markRequestContacted(form: FormData) {
  await requireAdmin();
  const parsed = requestRef.safeParse(Object.fromEntries(form));
  if (!parsed.success) redirect("/admin/requests");
  await prisma.customRequest.updateMany({ where: { id: parsed.data.id, contactedAt: null }, data: { contactedAt: new Date() } });
  redirect("/admin/requests");
}

const productUpdate = z.object({
  id: z.string().min(1).max(100),
  price: z.coerce.number().int("Price must be a whole number of rupees").min(1).max(10_000_000),
  sold: z.literal("on").optional(),
  hidden: z.literal("on").optional(),
});

export async function updateProduct(form: FormData): Promise<void> {
  await requireAdmin();
  const parsed = productUpdate.safeParse(Object.fromEntries(form));
  if (!parsed.success) redirect(`/admin/products?error=${encodeURIComponent(parsed.error.issues[0].message)}`);
  const { id, price, sold, hidden } = parsed.data;

  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) redirect("/admin/products");
  await prisma.product.update({
    where: { id },
    // Made-to-order pieces never sell out, so "sold" doesn't apply to them.
    data: { price, hidden: hidden === "on", sold: product.madeToOrder ? false : sold === "on" },
  });
  updateTag("products");
  redirect(`/admin/products?saved=${encodeURIComponent(id)}#${encodeURIComponent(id)}`);
}
