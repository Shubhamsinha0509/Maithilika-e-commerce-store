import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { saveProfile, signOut } from "@/app/account/actions";
import { GoogleButton } from "@/components/google-button";
import { formatDate } from "@/lib/admin";
import { currentCustomer, signInEnabled } from "@/lib/customer-auth";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "My account" };

export default function AccountPage({ searchParams }: PageProps<"/account">) {
  return (
    <section className="wrap custom-page">
      <Suspense fallback={<div className="custom-loading" />}>
        <Account query={searchParams} />
      </Suspense>
    </section>
  );
}

async function Account({ query }: { query: PageProps<"/account">["searchParams"] }) {
  const [customer, params] = await Promise.all([currentCustomer(), query]);

  if (!customer) {
    return (
      <div className="custom-step">
        <h1 className="custom-question">Welcome to Maithilika</h1>
        <p className="custom-sub">Sign in to send us your custom order ideas and have your details filled in at checkout.</p>
        {params.signin === "failed" && <p role="alert" className="custom-note">That sign-in didn&apos;t work. Please try again.</p>}
        {signInEnabled() ? <GoogleButton next="/account" /> : <p className="custom-sub">Sign-in opens soon.</p>}
      </div>
    );
  }

  const requests = await prisma.customRequest.findMany({ where: { customerId: customer.id }, orderBy: { createdAt: "desc" }, take: 50 });
  const error = typeof params.error === "string" ? params.error : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <span className="eyebrow">My account</span>
        <h1 className="section-title">Namaste, {customer.name.split(/\s+/)[0]}</h1>
        <p className="field-help">{customer.email}</p>
      </div>

      <form action={saveProfile} className="checkout-form" style={{ gap: 14 }}>
        <label className="field">
          <span>Name</span>
          <input name="name" defaultValue={customer.name} autoComplete="name" maxLength={100} required />
        </label>
        <label className="field">
          <span>Mobile number</span>
          <input name="phone" type="tel" inputMode="tel" autoComplete="tel" defaultValue={customer.phone ?? ""} placeholder="98765 43210" required />
        </label>
        {error && <p role="alert" className="checkout-message">{error}</p>}
        {params.saved === "1" && !error && <p role="status" className="field-help">Saved.</p>}
        <button type="submit" className="btn btn-outline" style={{ alignSelf: "flex-start" }}>Save</button>
      </form>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <h2 className="checkout-legend" style={{ margin: 0 }}>My custom orders</h2>
        {requests.length === 0 ? (
          <p className="field-help">Nothing yet. <Link href="/custom-order">Tell us your idea</Link></p>
        ) : (
          requests.map((r) => (
            <div key={r.id} className="account-request">
              <strong>{[r.type, r.fabric].filter(Boolean).join(" · ")}</strong>
              <span style={{ whiteSpace: "pre-wrap" }}>{r.description}</span>
              <span className="field-help">
                {formatDate(r.createdAt)} · {r.contactedAt ? "We have been in touch" : "We'll be in touch soon"}
              </span>
            </div>
          ))
        )}
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 20 }}>
        <Link href="/order">Track an order</Link>
        <form action={signOut}>
          <button type="submit" className="link-button">Sign out</button>
        </form>
      </div>
    </div>
  );
}
