import type { Metadata } from "next";
import { CheckoutForm } from "@/components/checkout-form";
import { paymentsEnabled } from "@/lib/razorpay";

export const metadata: Metadata = { title: "Checkout" };

export default function CheckoutPage() {
  return (
    <section className="wrap" style={{ paddingBlock: "clamp(28px, 4vw, 48px) 72px" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 28 }}>
        <span className="eyebrow">Checkout</span>
        <h1 className="section-title">Where should we send it?</h1>
      </div>
      <CheckoutForm paymentsEnabled={paymentsEnabled()} />
    </section>
  );
}
