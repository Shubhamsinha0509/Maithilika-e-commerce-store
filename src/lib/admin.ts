import type { OrderStatus } from "@/generated/prisma/client";

/** How the admin names each status. "PAID" is the work queue, so it reads "To ship". */
export const STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING_PAYMENT: "Unpaid",
  PAID: "To ship",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

export const formatDate = (d: Date) =>
  d.toLocaleString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
