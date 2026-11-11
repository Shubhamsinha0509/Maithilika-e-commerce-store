"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { saveProfile, type ProfileInput } from "@/app/account/actions";
import { useCart } from "@/components/cart";
import { INDIAN_STATES, type FieldErrors } from "@/lib/checkout";

/** The profile: contact details and an optional delivery address, used to fill in checkout. */
export function AccountForm({ initial, email }: { initial: ProfileInput; email: string }) {
  const router = useRouter();
  const { count } = useCart();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState<string | null>(null);

  const submit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const field = (k: keyof ProfileInput) => String(data.get(k) ?? "");
    setSaving(true);
    setSaved(false);
    setMessage(null);
    setErrors({});
    const result = await saveProfile({
      name: field("name"),
      phone: field("phone"),
      addressLine1: field("addressLine1"),
      addressLine2: field("addressLine2"),
      city: field("city"),
      state: field("state"),
      pincode: field("pincode"),
    }).catch(() => ({ ok: false as const, error: "That didn't save. Please check your connection and try again." }));
    setSaving(false);
    if (result.ok) {
      setSaved(true);
      router.refresh();
      return;
    }
    setMessage(result.error);
    if ("fieldErrors" in result && result.fieldErrors) setErrors(result.fieldErrors);
  };

  const err = (k: string) => errors[k] && <span className="field-error">{errors[k]}</span>;

  return (
    <form onSubmit={submit} onInput={() => saved && setSaved(false)} className="checkout-form account-form" noValidate>
      <fieldset disabled={saving}>
        <legend className="checkout-legend">Your details</legend>
        <label className="field">
          <span>Name</span>
          <input name="name" defaultValue={initial.name} autoComplete="name" maxLength={100} aria-invalid={!!errors.name} />
          {err("name")}
        </label>
        <div className="field-row">
          <label className="field">
            <span>Mobile number</span>
            <input name="phone" type="tel" inputMode="tel" autoComplete="tel" defaultValue={initial.phone} placeholder="98765 43210" aria-invalid={!!errors.phone} />
            {err("phone")}
          </label>
          <label className="field">
            <span>Email</span>
            <input value={email} readOnly aria-readonly="true" className="field-readonly" />
          </label>
        </div>
      </fieldset>

      <fieldset disabled={saving}>
        <legend className="checkout-legend">Delivery address</legend>
        <p className="field-help" style={{ marginTop: -6 }}>Optional. We fill it in for you at checkout.</p>
        <label className="field">
          <span>House number and street</span>
          <input name="addressLine1" defaultValue={initial.addressLine1} autoComplete="address-line1" maxLength={200} aria-invalid={!!errors.addressLine1} />
          {err("addressLine1")}
        </label>
        <label className="field">
          <span>Area or landmark <em>(optional)</em></span>
          <input name="addressLine2" defaultValue={initial.addressLine2} autoComplete="address-line2" maxLength={200} />
        </label>
        <div className="field-row three">
          <label className="field">
            <span>City</span>
            <input name="city" defaultValue={initial.city} autoComplete="address-level2" maxLength={100} aria-invalid={!!errors.city} />
            {err("city")}
          </label>
          <label className="field">
            <span>State</span>
            <select name="state" defaultValue={initial.state} autoComplete="address-level1" aria-invalid={!!errors.state}>
              <option value="">Choose…</option>
              {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            {err("state")}
          </label>
          <label className="field">
            <span>PIN code</span>
            <input name="pincode" defaultValue={initial.pincode} inputMode="numeric" autoComplete="postal-code" maxLength={6} aria-invalid={!!errors.pincode} />
            {err("pincode")}
          </label>
        </div>
      </fieldset>

      {message && <p role="alert" className="checkout-message">{message}</p>}

      {saved ? (
        <div role="status" className="account-saved">
          <strong>✓ Your details are saved</strong>
          <span>We&apos;ll fill them in for you at checkout.</span>
          <div className="account-next">
            {count > 0 ? (
              <Link href="/checkout" className="btn btn-primary">Go to checkout ({count}) <span className="btn-arrow" aria-hidden="true">→</span></Link>
            ) : (
              <Link href="/" className="btn btn-primary">Continue shopping <span className="btn-arrow" aria-hidden="true">→</span></Link>
            )}
          </div>
        </div>
      ) : (
        <button type="submit" className="btn btn-primary" disabled={saving} style={{ alignSelf: "flex-start", minWidth: 200 }}>
          {saving ? "Saving…" : "Save details"}
        </button>
      )}
    </form>
  );
}
