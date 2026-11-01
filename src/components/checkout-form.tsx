"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { confirmPayment, startCheckout } from "@/app/checkout/actions";
import { useCart } from "@/components/cart";
import { INDIAN_STATES, type FieldErrors } from "@/lib/checkout";
import { inr, shippingFor, SHIPPING } from "@/lib/store";

type RazorpayResponse = { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string };
type RazorpayInstance = { open: () => void };
declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => RazorpayInstance;
  }
}

function loadRazorpay(): Promise<boolean> {
  if (window.Razorpay) return Promise.resolve(true);
  return new Promise((resolve) => {
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

type Status = "idle" | "placing" | "paying" | "confirming";

export function CheckoutForm({ paymentsEnabled }: { paymentsEnabled: boolean }) {
  const router = useRouter();
  const cart = useCart();
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});

  const shipping = shippingFor(cart.subtotal);
  const total = cart.subtotal + shipping;
  const busy = status !== "idle";

  if (cart.lines.length === 0 && status === "idle") {
    return (
      <div className="empty-state">
        <span className="display" style={{ fontSize: 26, color: "var(--brand)" }}>Your bag is empty</span>
        <span style={{ fontSize: 15.5, color: "var(--muted)" }}>Add a piece to your bag, then come back here to check out.</span>
        <Link href="/clothing" className="btn btn-primary" style={{ marginTop: 6 }}>Browse clothing</Link>
      </div>
    );
  }

  const submit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (busy) return;
    const f = new FormData(e.currentTarget);
    const field = (k: string) => String(f.get(k) ?? "");
    setMessage(null);
    setErrors({});
    setStatus("placing");

    const result = await startCheckout({
      lines: cart.lines.map((l) => ({ id: l.id, option: l.option, qty: l.qty })),
      name: field("name"),
      email: field("email"),
      phone: field("phone"),
      addressLine1: field("addressLine1"),
      addressLine2: field("addressLine2"),
      city: field("city"),
      state: field("state") as (typeof INDIAN_STATES)[number],
      pincode: field("pincode"),
    }).catch(() => ({ ok: false as const, error: "Something went wrong. Please try again." }));

    if (!result.ok) {
      setStatus("idle");
      setMessage(result.error);
      if ("fieldErrors" in result) setErrors(result.fieldErrors);
      if ("soldIds" in result && result.soldIds?.length) {
        const names = cart.lines.filter((l) => result.soldIds!.includes(l.id)).map((l) => l.name);
        cart.removeProducts(result.soldIds);
        setMessage(`Sorry, ${names.join(", ")} has just been sold, so we removed it from your bag. Please review your order and try again.`);
      }
      return;
    }

    if (!(await loadRazorpay()) || !window.Razorpay) {
      setStatus("idle");
      setMessage("The payment window couldn't load. Check your connection and try again.");
      return;
    }

    const email = field("email").trim().toLowerCase();
    const { orderNumber, razorpay } = result;
    setStatus("paying");
    new window.Razorpay({
      key: razorpay.keyId,
      order_id: razorpay.orderId,
      amount: razorpay.amount,
      currency: "INR",
      name: "Maithilika",
      description: `Order ${orderNumber}`,
      prefill: { name: field("name"), email, contact: field("phone") },
      theme: { color: "#6E1423" },
      modal: {
        ondismiss: () => {
          setStatus("idle");
          setMessage("Payment wasn't completed. Your bag is saved, so you can try again.");
        },
      },
      handler: async (response: RazorpayResponse) => {
        setStatus("confirming");
        const confirmed = await confirmPayment(response).catch(() => null);
        if (confirmed?.ok) {
          cart.clear();
          router.push(`/order?n=${encodeURIComponent(orderNumber)}&e=${encodeURIComponent(email)}&new=1`);
        } else {
          // The payment went through; the webhook will still mark the order paid.
          setStatus("idle");
          setMessage(`We received your payment but couldn't confirm it on this page. Please keep your order number, ${orderNumber}, and check it on the Track your order page in a few minutes.`);
        }
      },
    }).open();
  };

  const err = (k: string) => errors[k] && <span className="field-error">{errors[k]}</span>;

  return (
    <div className="checkout-grid">
      <form onSubmit={submit} className="checkout-form" noValidate>
        <fieldset disabled={busy}>
          <legend className="checkout-legend">Contact</legend>
          <label className="field">
            <span>Full name</span>
            <input name="name" autoComplete="name" required maxLength={100} aria-invalid={!!errors.name} />
            {err("name")}
          </label>
          <div className="field-row">
            <label className="field">
              <span>Mobile number</span>
              <input name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="98765 43210" required aria-invalid={!!errors.phone} />
              {err("phone")}
            </label>
            <label className="field">
              <span>Email</span>
              <input name="email" type="email" autoComplete="email" required aria-invalid={!!errors.email} />
              {err("email")}
            </label>
          </div>
          <p className="field-help">The courier may call this number before delivery. Your order confirmation is linked to this email.</p>
        </fieldset>

        <fieldset disabled={busy}>
          <legend className="checkout-legend">Delivery address</legend>
          <label className="field">
            <span>House number and street</span>
            <input name="addressLine1" autoComplete="address-line1" required maxLength={200} aria-invalid={!!errors.addressLine1} />
            {err("addressLine1")}
          </label>
          <label className="field">
            <span>Area or landmark <em>(optional)</em></span>
            <input name="addressLine2" autoComplete="address-line2" maxLength={200} />
          </label>
          <div className="field-row three">
            <label className="field">
              <span>City</span>
              <input name="city" autoComplete="address-level2" required maxLength={100} aria-invalid={!!errors.city} />
              {err("city")}
            </label>
            <label className="field">
              <span>State</span>
              <select name="state" autoComplete="address-level1" required defaultValue="" aria-invalid={!!errors.state}>
                <option value="" disabled>Choose…</option>
                {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              {err("state")}
            </label>
            <label className="field">
              <span>PIN code</span>
              <input name="pincode" inputMode="numeric" autoComplete="postal-code" maxLength={6} required aria-invalid={!!errors.pincode} />
              {err("pincode")}
            </label>
          </div>
        </fieldset>

        {message && <p role="alert" className="checkout-message">{message}</p>}

        {paymentsEnabled ? (
          <button type="submit" className="btn btn-primary" disabled={busy} style={{ minHeight: 54, fontSize: 17 }}>
            {status === "placing" ? "Checking your order…" : status === "paying" ? "Waiting for payment…" : status === "confirming" ? "Confirming payment…" : `Pay ${inr(total)}`}
          </button>
        ) : (
          <button type="button" className="btn btn-primary" disabled style={{ minHeight: 54, fontSize: 17 }}>Checkout opens soon</button>
        )}
        <p className="field-help" style={{ textAlign: "center" }}>Secure payment by Razorpay: UPI, cards and netbanking.</p>
      </form>

      <aside className="checkout-summary" aria-label="Order summary">
        <h2 className="display" style={{ margin: 0, fontSize: 24, color: "var(--brand)" }}>Your order</h2>
        <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {cart.lines.map((l) => (
            <li key={l.key} className="summary-line">
              <span className="cart-thumb" style={{ width: 56 }}>
                {/* eslint-disable-next-line @next/next/no-img-element -- collage crop needs width > 100% */}
                <img src={l.image} alt="" style={{ width: l.crop.width, objectPosition: l.crop.position }} />
              </span>
              <span style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0, flex: 1 }}>
                <span style={{ fontWeight: 600, fontSize: 15, lineHeight: 1.3 }}>{l.name}</span>
                {l.option && <span style={{ fontSize: 13.5, color: "var(--muted)" }}>{l.option}</span>}
                {l.qty > 1 && <span style={{ fontSize: 13.5, color: "var(--muted)" }}>Quantity {l.qty}</span>}
              </span>
              <span style={{ fontWeight: 600 }}>{inr(l.price * l.qty)}</span>
            </li>
          ))}
        </ul>
        <dl className="summary-totals">
          <div><dt>Subtotal</dt><dd>{inr(cart.subtotal)}</dd></div>
          <div><dt>Shipping</dt><dd>{shipping === 0 ? "Free" : inr(shipping)}</dd></div>
          <div className="grand"><dt>Total</dt><dd>{inr(total)}</dd></div>
        </dl>
        {shipping > 0 && (
          <p className="field-help">Add {inr(SHIPPING.freeAboveRupees - cart.subtotal)} more for free shipping.</p>
        )}
        <p className="field-help">Prices and availability are confirmed when you pay.</p>
      </aside>
    </div>
  );
}
