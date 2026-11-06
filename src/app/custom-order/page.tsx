import type { Metadata } from "next";
import { CustomOrderForm } from "@/components/custom-order-form";

export const metadata: Metadata = { title: "Custom order" };

export default function CustomOrderPage() {
  return (
    <section className="wrap custom-page">
      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 28 }}>
        <span className="eyebrow">Custom order</span>
        <h1 className="section-title">Have something painted for you</h1>
      </div>
      <CustomOrderForm />
    </section>
  );
}
