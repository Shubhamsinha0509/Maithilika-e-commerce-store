import Link from "next/link";
import { POLICIES_UPDATED, POLICY_LINKS } from "@/lib/policies";

/** Shows a business detail, or a visible marker while the owner hasn't confirmed it. */
export function Fact({ value, label }: { value: string | number | null; label: string }) {
  return value === null ? <mark className="tbc">{label}: to be confirmed</mark> : <>{value}</>;
}

export function PolicyPage({ href, title, intro, children }: { href: string; title: string; intro: string; children: React.ReactNode }) {
  return (
    <section className="wrap policy-page">
      <nav aria-label="Help and policies" className="policy-nav">
        {POLICY_LINKS.map((l) => (
          <Link key={l.href} href={l.href} aria-current={l.href === href ? "page" : undefined}>
            {l.label}
          </Link>
        ))}
      </nav>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <span className="eyebrow">Help</span>
        <h1 className="section-title">{title}</h1>
        <p className="lede">{intro}</p>
        <p className="field-help">Last updated {POLICIES_UPDATED}</p>
      </div>
      <div className="policy">{children}</div>
    </section>
  );
}
