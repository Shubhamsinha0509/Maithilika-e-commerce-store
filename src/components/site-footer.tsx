import Link from "next/link";
import { Logo } from "@/components/logo";
import { POLICY_LINKS } from "@/lib/policies";
import { CONTACT_EMAIL, SECTIONS, sectionHref } from "@/lib/store";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      {/* A painted Mithila border along the top edge. */}
      <div className="mithila-border" aria-hidden="true" />

      <div className="wrap footer-brand">
        <Logo size={84} />
        <span className="display footer-wordmark">Maithilika</span>
        <span className="display footer-wordmark-hi">मैथिलिका</span>
        <span className="footer-tagline">Carrying Mithila’s heritage</span>
        <div className="dot-band" style={{ width: "min(100%, 420px)" }} />
        <p className="footer-promise">Painted by hand. Worn like a story.</p>
      </div>

      <div className="wrap footer-grid">
        <nav aria-label="Shop" className="footer-col">
          <span className="footer-head">Shop</span>
          {SECTIONS.map((s) => (
            <Link key={s.key} href={sectionHref(s.key)}>{s.label}</Link>
          ))}
        </nav>
        <nav aria-label="Maithilika" className="footer-col">
          <span className="footer-head">Maithilika</span>
          <Link href="/#story">Our Story</Link>
          <Link href="/#motifs">Motif meanings</Link>
          <Link href="/wishlist">Wishlist</Link>
          <Link href="/order">Track your order</Link>
        </nav>
        <nav aria-label="Help" className="footer-col">
          <span className="footer-head">Help</span>
          {POLICY_LINKS.map((l) => (
            <Link key={l.href} href={l.href}>{l.label}</Link>
          ))}
        </nav>
        <div className="footer-col">
          <span className="footer-head">Write to us</span>
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
          <span style={{ fontSize: 14, lineHeight: 1.5, color: "var(--on-dark)" }}>Questions about a piece, an order or a delivery.</span>
        </div>
      </div>

      <div className="footer-base">
        <div className="wrap footer-base-row">
          <span>© Maithilika. Every piece painted by hand in Mithila.</span>
          <span>Secure payments by Razorpay · UPI · Cards · Netbanking</span>
          <span className="footer-credit">Developed by Tanay Harsh and Shubham Sinha</span>
        </div>
      </div>
    </footer>
  );
}
