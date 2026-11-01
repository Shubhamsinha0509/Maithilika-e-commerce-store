import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { cancelUnpaidOrder, updateOrder } from "@/app/admin/actions";
import { formatDate, STATUS_LABEL } from "@/lib/admin";
import { AdminNav } from "@/components/admin-nav";
import { requireAdmin } from "@/lib/admin-auth";
import type { OrderItem } from "@/lib/orders";
import { prisma } from "@/lib/prisma";
import { inr, productHref } from "@/lib/store";

export const metadata: Metadata = { title: "Order · Admin" };

export default function AdminOrderPage(props: PageProps<"/admin/orders/[number]">) {
  return (
    <section className="wrap admin-page">
      <Suspense fallback={<p>Loading…</p>}>
        <OrderDetail {...props} />
      </Suspense>
    </section>
  );
}

async function OrderDetail({ params, searchParams }: PageProps<"/admin/orders/[number]">) {
  await requireAdmin();
  const [{ number }, query] = await Promise.all([params, searchParams]);
  const order = await prisma.order.findUnique({ where: { orderNumber: decodeURIComponent(number) } });
  if (!order) notFound();
  const items = order.items as unknown as OrderItem[];
  const unpaid = order.status === "PENDING_PAYMENT";

  return (
    <>
      <AdminNav current="orders" />
      <Link href="/admin" className="text-link" style={{ fontSize: 15 }}>← All orders</Link>

      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: "8px 16px" }}>
        <h1 className="section-title" style={{ fontSize: "clamp(26px, 3vw, 36px)" }}>{order.orderNumber}</h1>
        <span className={`status status-${order.status.toLowerCase()}`}>{STATUS_LABEL[order.status]}</span>
        <span className="field-help">Placed {formatDate(order.createdAt)}{order.paidAt && ` · paid ${formatDate(order.paidAt)}`}</span>
      </div>

      {query.saved && <p role="status" className="admin-saved">Saved.</p>}
      {typeof query.error === "string" && <p role="alert" className="checkout-message">{query.error}</p>}
      {order.note && <p className="checkout-message"><strong>Note:</strong> {order.note}</p>}

      <div className="order-columns">
        <div className="checkout-summary">
          <h2 className="admin-h2">Items</h2>
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {items.map((i) => (
              <li key={i.productId + (i.option ?? "")} className="summary-line">
                <span style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1, minWidth: 0 }}>
                  <Link href={productHref(i.productId)} target="_blank" style={{ fontWeight: 600, color: "var(--ink)" }}>{i.name}</Link>
                  {i.option && <span className="field-help">{i.optionLabel}: {i.option}</span>}
                  <span className="field-help">
                    {i.qty > 1 ? `Quantity ${i.qty} · ` : ""}{i.madeToOrder ? "Made to order: paint before shipping" : "Ready to ship"}
                  </span>
                </span>
                <span style={{ fontWeight: 600 }}>{inr(i.price * i.qty)}</span>
              </li>
            ))}
          </ul>
          <dl className="summary-totals">
            <div><dt>Subtotal</dt><dd>{inr(order.subtotal)}</dd></div>
            <div><dt>Shipping</dt><dd>{order.shipping === 0 ? "Free" : inr(order.shipping)}</dd></div>
            <div className="grand"><dt>Total</dt><dd>{inr(order.total)}</dd></div>
          </dl>
        </div>

        <div className="checkout-summary">
          <h2 className="admin-h2">Ship to</h2>
          <address style={{ fontStyle: "normal", fontSize: 15.5, lineHeight: 1.6 }}>
            <strong>{order.name}</strong><br />
            {order.addressLine1}<br />
            {order.addressLine2 && <>{order.addressLine2}<br /></>}
            {order.city}, {order.state} {order.pincode}
          </address>
          <p style={{ margin: 0, fontSize: 15 }}>
            Phone: <a href={`tel:${order.phone}`}>{order.phone}</a><br />
            Email: <a href={`mailto:${order.email}`}>{order.email}</a>
          </p>
          <p className="field-help" style={{ wordBreak: "break-all" }}>
            Razorpay order: {order.razorpayOrderId ?? "—"}<br />
            Razorpay payment: {order.razorpayPaymentId ?? "—"}
          </p>
        </div>
      </div>

      <div className="checkout-summary" style={{ maxWidth: 720 }}>
        <h2 className="admin-h2">Update</h2>
        {unpaid ? (
          <>
            <p className="field-help">This order was never paid, usually because the customer closed the payment window. Nothing needs shipping. You can cancel it to tidy the list.</p>
            <form action={cancelUnpaidOrder}>
              <input type="hidden" name="orderNumber" value={order.orderNumber} />
              <button type="submit" className="btn btn-outline">Cancel this unpaid order</button>
            </form>
          </>
        ) : (
          <form action={updateOrder} className="checkout-form" style={{ gap: 14 }}>
            <input type="hidden" name="orderNumber" value={order.orderNumber} />
            <label className="field">
              <span>Status</span>
              <select name="status" defaultValue={order.status}>
                <option value="PAID">To ship (paid)</option>
                <option value="SHIPPED">Shipped</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </label>
            <label className="field">
              <span>Tracking link <em>(from the courier, shown to the customer)</em></span>
              <input name="trackingUrl" type="url" defaultValue={order.trackingUrl ?? ""} placeholder="https://…" />
            </label>
            <label className="field">
              <span>Note <em>(only you see this)</em></span>
              <textarea name="note" defaultValue={order.note ?? ""} rows={3} className="admin-textarea" />
            </label>
            <p className="field-help">
              Cancelling a paid order does not refund it. Refund it in the Razorpay dashboard, and if it was a one-of-a-kind piece, mark it available again under Products.
            </p>
            <button type="submit" className="btn btn-primary" style={{ alignSelf: "flex-start" }}>Save</button>
          </form>
        )}
      </div>
    </>
  );
}
