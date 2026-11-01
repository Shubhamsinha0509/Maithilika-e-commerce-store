import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { findOrder, type OrderItem } from "@/lib/orders";
import { inr, productHref } from "@/lib/store";

export const metadata: Metadata = { title: "Your order" };

const STATUS: Record<string, { label: string; text: string }> = {
  PENDING_PAYMENT: { label: "Awaiting payment", text: "We haven't received payment for this order yet." },
  PAID: { label: "Paid", text: "Thank you. Your order is being prepared for dispatch." },
  SHIPPED: { label: "Shipped", text: "Your order is on its way." },
  DELIVERED: { label: "Delivered", text: "Your order has been delivered. We hope you love it." },
  CANCELLED: { label: "Cancelled", text: "This order was cancelled." },
};

type Query = { n: string; e: string; isNew: boolean };

export default function OrderPage({ searchParams }: PageProps<"/order">) {
  const query = searchParams.then((s): Query => ({
    n: typeof s.n === "string" ? s.n : "",
    e: typeof s.e === "string" ? s.e : "",
    isNew: s.new === "1",
  }));
  return (
    <section className="wrap" style={{ paddingBlock: "clamp(28px, 4vw, 48px) 72px", minHeight: "50vh" }}>
      <Suspense fallback={<h1 className="section-title">Loading your order…</h1>}>
        <OrderView query={query} />
      </Suspense>
    </section>
  );
}

async function OrderView({ query }: { query: Promise<Query> }) {
  const { n, e, isNew } = await query;
  const order = n && e ? await findOrder(n, e) : null;

  if (!order) {
    return (
      <div style={{ maxWidth: 520, display: "flex", flexDirection: "column", gap: 18 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span className="eyebrow">Track your order</span>
          <h1 className="section-title">Find your order</h1>
          <p className="lede">Enter the order number from your confirmation and the email you used at checkout.</p>
        </div>
        {n && e && <p role="alert" className="checkout-message">We couldn&apos;t find an order with that number and email.</p>}
        <form method="get" action="/order" className="checkout-form" style={{ gap: 14 }}>
          <label className="field">
            <span>Order number</span>
            <input name="n" defaultValue={n} placeholder="MTH-XXXXXXXX" required autoCapitalize="characters" />
          </label>
          <label className="field">
            <span>Email</span>
            <input name="e" type="email" defaultValue={e} required />
          </label>
          <button type="submit" className="btn btn-primary">Find my order</button>
        </form>
      </div>
    );
  }

  const status = STATUS[order.status] ?? STATUS.PENDING_PAYMENT;
  const items = order.items as unknown as OrderItem[];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28, maxWidth: 820 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <span className="eyebrow">{isNew ? "Order placed" : "Your order"}</span>
        <h1 className="section-title">{isNew ? "Thank you for your order" : `Order ${order.orderNumber}`}</h1>
        <p className="lede">{status.text}</p>
      </div>

      <dl className="facts">
        <div><dt>Order number</dt><dd>{order.orderNumber}</dd></div>
        <div><dt>Status</dt><dd>{status.label}</dd></div>
        <div><dt>Total</dt><dd>{inr(order.total)}</dd></div>
      </dl>

      {order.trackingUrl && (
        <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ alignSelf: "flex-start" }}>
          Track your parcel
        </a>
      )}

      <div className="order-columns">
        <div className="checkout-summary">
          <h2 className="display" style={{ margin: 0, fontSize: 22, color: "var(--indigo)" }}>Items</h2>
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {items.map((i) => (
              <li key={i.productId + (i.option ?? "")} className="summary-line">
                <span style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1, minWidth: 0 }}>
                  <Link href={productHref(i.productId)} style={{ fontWeight: 600, fontSize: 15, color: "var(--ink)", textDecoration: "none" }}>{i.name}</Link>
                  {i.option && <span style={{ fontSize: 13.5, color: "var(--muted)" }}>{i.optionLabel}: {i.option}</span>}
                  {i.qty > 1 && <span style={{ fontSize: 13.5, color: "var(--muted)" }}>Quantity {i.qty}</span>}
                  {i.madeToOrder && <span style={{ fontSize: 13.5, color: "var(--maroon)" }}>Made to order</span>}
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
          <h2 className="display" style={{ margin: 0, fontSize: 22, color: "var(--indigo)" }}>Delivering to</h2>
          <address style={{ fontStyle: "normal", fontSize: 15.5, lineHeight: 1.6 }}>
            {order.name}<br />
            {order.addressLine1}<br />
            {order.addressLine2 && <>{order.addressLine2}<br /></>}
            {order.city}, {order.state} {order.pincode}<br />
            {order.phone}
          </address>
        </div>
      </div>

      {isNew && (
        <p className="field-help">
          Keep your order number, <strong>{order.orderNumber}</strong>. You can check this order any time on the{" "}
          <Link href="/order">Track your order</Link> page with it and your email.
        </p>
      )}
    </div>
  );
}
