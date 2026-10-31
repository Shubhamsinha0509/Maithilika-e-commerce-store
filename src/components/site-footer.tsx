import Link from "next/link";
import { Logo } from "@/components/logo";
import { SECTIONS, sectionHref } from "@/lib/store";

/**
 * Help and policy links, the studio address and contact details are hidden
 * until those pages and details exist (docs/plan.md).
 */
export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="dot-band" />
      <div className="wrap footer-grid">
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Logo size={40} />
            <span style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
              <span className="display" style={{ fontSize: 26 }}>Maithilika</span>
              <span className="display" style={{ fontSize: 15, color: "var(--gold-light)" }}>मैथिलिका</span>
            </span>
          </div>
          <p style={{ margin: 0, fontSize: 15, lineHeight: 1.55, color: "var(--on-dark)", maxWidth: "30ch" }}>
            Painted by hand. Worn like a story.
          </p>
        </div>
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
        </nav>
      </div>
      <div className="wrap footer-base">
        <span>© Maithilika. Every piece painted by hand in Mithila.</span>
      </div>
    </footer>
  );
}
