"use client";

import { useActionState } from "react";
import { login } from "@/app/admin/actions";

export function AdminLoginForm() {
  const [error, action, pending] = useActionState(login, null);
  return (
    <form action={action} className="checkout-form" style={{ gap: 14 }}>
      <label className="field">
        <span>Password</span>
        <input name="password" type="password" autoComplete="current-password" required autoFocus />
      </label>
      {error && <p role="alert" className="checkout-message">{error}</p>}
      <button type="submit" className="btn btn-primary" disabled={pending}>{pending ? "Signing in…" : "Sign in"}</button>
    </form>
  );
}
