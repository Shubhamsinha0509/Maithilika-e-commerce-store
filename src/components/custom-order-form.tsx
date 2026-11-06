"use client";

import Link from "next/link";
import { useState } from "react";
import { sendCustomOrder } from "@/app/custom-order/actions";
import type { FieldErrors } from "@/lib/checkout";
import { CUSTOM_ORDER_TYPES, SAREE_FABRICS } from "@/lib/custom-order";

type OrderType = (typeof CUSTOM_ORDER_TYPES)[number];
type Fabric = (typeof SAREE_FABRICS)[number];

export function CustomOrderForm() {
  const [type, setType] = useState<OrderType | null>(null);
  const [fabric, setFabric] = useState<Fabric | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <div role="status" className="custom-thanks">
        <div className="dot-band" aria-hidden="true" />
        <h2 className="section-title">Thank you</h2>
        <p className="lede">We will get in contact within 1-2 hr.</p>
        <Link href="/" className="btn btn-primary">Back to the shop</Link>
      </div>
    );
  }

  const submit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!type) return;
    const data = new FormData(e.currentTarget);
    const field = (k: string) => String(data.get(k) ?? "");
    setSending(true);
    setMessage(null);
    setErrors({});
    const result = await sendCustomOrder(
      { type, fabric, description: field("description"), name: field("name"), phone: field("phone") },
      field("website"),
    ).catch(() => ({ ok: false as const, error: "We couldn't send this. Please check your connection and try again." }));
    setSending(false);
    if (result.ok) {
      setSent(true);
      return;
    }
    setMessage(result.error);
    if ("fieldErrors" in result && result.fieldErrors) setErrors(result.fieldErrors);
  };

  const err = (k: string) => errors[k] && <span className="field-error">{errors[k]}</span>;

  return (
    <form onSubmit={submit} className="checkout-form" noValidate>
      <fieldset>
        <legend className="checkout-legend">What would you like painted?</legend>
        <div className="custom-types">
          {CUSTOM_ORDER_TYPES.map((t) => (
            <label key={t} className="custom-type">
              <input type="radio" name="type" checked={type === t} onChange={() => setType(t)} />
              <span className="display">{t}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {type === "Saree" && (
        <fieldset>
          <legend className="checkout-legend">Which fabric?</legend>
          <div className="custom-fabrics">
            {SAREE_FABRICS.map((f) => (
              <label key={f} className="custom-fabric">
                <input type="radio" name="fabric" checked={fabric === f} onChange={() => setFabric(f)} />
                <span>{f}</span>
              </label>
            ))}
          </div>
          {err("fabric")}
        </fieldset>
      )}

      {type && (
        <fieldset disabled={sending}>
          <legend className="checkout-legend">Tell us about it</legend>
          <label className="field">
            <span>What do you have in mind?</span>
            <textarea
              name="description"
              rows={5}
              maxLength={2000}
              placeholder="The motifs, colours, size, the occasion, and when you need it."
              aria-invalid={!!errors.description}
            />
            {err("description")}
          </label>
          <div className="field-row">
            <label className="field">
              <span>Your name</span>
              <input name="name" autoComplete="name" aria-invalid={!!errors.name} />
              {err("name")}
            </label>
            <label className="field">
              <span>Mobile number</span>
              <input name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="98765 43210" aria-invalid={!!errors.phone} />
              {err("phone")}
            </label>
          </div>
          <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="custom-trap" />

          {message && <p role="alert" className="checkout-message">{message}</p>}
          <button type="submit" className="btn btn-primary" disabled={sending} style={{ minHeight: 54, fontSize: 17 }}>
            {sending ? "Sending…" : "Send request"}
          </button>
        </fieldset>
      )}
    </form>
  );
}
