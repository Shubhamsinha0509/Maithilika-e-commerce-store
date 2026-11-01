import type { Metadata } from "next";
import { AdminLoginForm } from "@/components/admin-login-form";

export const metadata: Metadata = { title: "Admin" };

// Static page: whether admin is configured is checked when signing in, not
// here, because this page is built once and env vars can be added later.
export default function AdminLoginPage() {
  return (
    <section className="wrap" style={{ paddingBlock: "64px 96px", display: "flex", justifyContent: "center" }}>
      <div style={{ width: "100%", maxWidth: 400, display: "flex", flexDirection: "column", gap: 18 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span className="eyebrow">Admin</span>
          <h1 className="section-title">Sign in</h1>
        </div>
        <AdminLoginForm />
      </div>
    </section>
  );
}
