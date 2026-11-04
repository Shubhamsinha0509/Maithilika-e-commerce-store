"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useCart } from "@/components/cart";
import { CartDrawer } from "@/components/cart-drawer";
import { Logo } from "@/components/logo";
import { WishlistLink } from "@/components/wishlist";
import { inr, SECTIONS, sectionHref, type SectionKey } from "@/lib/store";

export type MenuPiece = {
  id: string;
  name: string;
  price: number;
  image: string;
  crop: { width: string; position: string };
};

type Props = { featured: Record<SectionKey, MenuPiece[]>; paymentsEnabled: boolean };

/** Opened by the listing page's mobile "Menu" button. */
export const OPEN_MENU_EVENT = "maithilika:menu";

export function SiteHeader({ featured, paymentsEnabled }: Props) {
  const router = useRouter();
  const cart = useCart();
  const [menu, setMenu] = useState<SectionKey | null>(null);
  const [drawer, setDrawer] = useState(false);
  const [accordion, setAccordion] = useState<SectionKey | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const openDrawer = () => setDrawer(true);
    window.addEventListener(OPEN_MENU_EVENT, openDrawer);
    return () => window.removeEventListener(OPEN_MENU_EVENT, openDrawer);
  }, []);

  // A touch tap on a section name opens its menu first; a mouse click (the
  // menu is already open on hover) or a keyboard Enter goes straight to it.
  const touchTap = useRef(false);

  // Any link click inside the header closes whatever menu is open. Pages stay
  // mounted between navigations, so state would otherwise survive the click.
  // This runs in the bubble phase, after the link's own onClick: closing the
  // menu first would make the section link think it was closed and reopen it
  // instead of navigating.
  const closeOnLink = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("a")) {
      setMenu(null);
      setDrawer(false);
    }
  };

  const submitSearch = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    const q = String(new FormData(e.currentTarget).get("q") ?? "").trim();
    if (!q) return;
    setSearchOpen(false);
    router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  const openSection = SECTIONS.find((s) => s.key === menu);

  return (
    <div className="site-header" onMouseLeave={() => setMenu(null)} onClick={closeOnLink}>

      <header className="header-bar">
        <div className="header-row">
          <button className="icon-btn mobile-only menu-btn" onClick={() => setDrawer(true)} aria-label="Open menu">
            <span /><span /><span className="short" />
          </button>
          <Link href="/" aria-label="Maithilika home" className="brand">
            <Logo size={44} />
            <span className="brand-words">
              <span className="display brand-en">Maithilika</span>
              <span className="display brand-hi">मैथिलिका</span>
            </span>
          </Link>

          <nav aria-label="Shop sections" className="main-nav desktop-only">
            {SECTIONS.map((s) => (
              <Link
                key={s.key}
                href={sectionHref(s.key)}
                aria-haspopup="true"
                aria-expanded={menu === s.key}
                className={menu === s.key ? "is-open" : undefined}
                onPointerEnter={(e) => e.pointerType === "mouse" && setMenu(s.key)}
                onPointerDown={(e) => { touchTap.current = e.pointerType !== "mouse"; }}
                onClick={(e) => {
                  // First tap on touch opens the menu; the second follows the link.
                  if (touchTap.current && menu !== s.key) {
                    e.preventDefault();
                    e.stopPropagation();
                    setMenu(s.key);
                  }
                  touchTap.current = false;
                }}
              >
                {s.label}
              </Link>
            ))}
          </nav>
          <span className="mobile-only" style={{ flex: 1 }} />

          <div className="header-icons">
            <button
              className="icon-btn"
              onClick={() => { setSearchOpen((o) => !o); setMenu(null); }}
              aria-label="Search"
              aria-expanded={searchOpen}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="#FBF6EA" strokeWidth="1.7" /><path d="M15.5 15.5 L21 21" stroke="#FBF6EA" strokeWidth="1.7" strokeLinecap="round" /></svg>
            </button>
            <WishlistLink />
            <button className="icon-btn" onClick={() => { cart.open(); setMenu(null); }} aria-label={cart.count ? `Bag, ${cart.count} items` : "Bag"} style={{ position: "relative" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path d="M4.5 8 H19.5 L18.5 21 H5.5 Z" fill="none" stroke="#FBF6EA" strokeWidth="1.7" strokeLinejoin="round" /><path d="M8.5 10 V7 a3.5 3.5 0 0 1 7 0 V10" fill="none" stroke="#FBF6EA" strokeWidth="1.7" /></svg>
              {cart.count > 0 && <span className="bag-count">{cart.count}</span>}
            </button>
          </div>
        </div>

        {searchOpen && (
          <form onSubmit={submitSearch} role="search" className="search-row">
            <input type="search" name="q" aria-label="Search Maithilika" placeholder="Search sarees, motifs, fabrics" autoFocus />
            <button type="submit" className="btn btn-primary" style={{ minHeight: 44, padding: "0 20px", fontSize: 15 }}>Search</button>
          </form>
        )}
      </header>

      {openSection && (
        <div className="mega desktop-only">
          <div className="wrap mega-grid">
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                <span className="display" style={{ fontSize: 28, color: "var(--brand)", lineHeight: 1.1 }}>{openSection.label}</span>
                <span className="display" style={{ fontSize: 17, color: "var(--maroon)" }}>{openSection.hi}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                {openSection.subs.map((sub) => (
                  <Link key={sub} href={sectionHref(openSection.key, { sub })} className="mega-sub">{sub}</Link>
                ))}
              </div>
              <Link href={sectionHref(openSection.key)} className="text-link" style={{ fontSize: 15 }}>
                Shop all {openSection.label.toLowerCase()} →
              </Link>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <span className="eyebrow ruled" style={{ fontSize: 12.5, letterSpacing: ".14em" }}>Featured pieces</span>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 20 }}>
                {featured[openSection.key].map((m) => (
                  <Link key={m.id} href={`/product/${m.id}`} className="mega-piece">
                    <span className="circle-frame" style={{ padding: 4 }}>
                      <span className="circle-inner">
                        <Image src={m.image} alt="" fill sizes="280px" className="crop-img" style={{ width: m.crop.width, objectPosition: m.crop.position }} />
                      </span>
                    </span>
                    <span style={{ fontWeight: 600, fontSize: 15.5, lineHeight: 1.3 }}>{m.name}</span>
                    <span style={{ fontSize: 14, color: "var(--muted)" }}>{inr(m.price)}</span>
                  </Link>
                ))}
              </div>
            </div>
            <div className="arch" style={{ padding: 7 }}>
              <div className="arch-inner" style={{ minHeight: 220 }}>
                <Image src={openSection.photo} alt="" fill sizes="360px" style={{ objectFit: "cover" }} />
              </div>
            </div>
          </div>
          <div className="dot-band" style={{ backgroundColor: "var(--ivory)" }} />
        </div>
      )}

      {drawer && (
        <div className="drawer-layer" style={{ zIndex: 100, flexDirection: "row" }}>
          <div className="menu-panel">
            <div className="panel-head">
              <span className="panel-title">
                <span className="display" style={{ fontSize: 22 }}>Maithilika</span>
                <span className="display" style={{ fontSize: 14, color: "var(--gold-light)" }}>मैथिलिका</span>
              </span>
              <button onClick={() => setDrawer(false)} aria-label="Close menu" className="panel-close">×</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", padding: "8px 18px" }}>
              {SECTIONS.map((s) => {
                const isOpen = accordion === s.key;
                return (
                  <div key={s.key} style={{ borderBottom: "1px solid var(--line-3)" }}>
                    <button className="drawer-toggle" aria-expanded={isOpen} onClick={() => setAccordion(isOpen ? null : s.key)}>
                      <span style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                        <span style={{ fontSize: 18, fontWeight: 600 }}>{s.label}</span>
                        <span className="display" style={{ fontSize: 14, color: "var(--maroon)" }}>{s.hi}</span>
                      </span>
                      <span style={{ fontSize: 22, color: "var(--maroon)", width: 24, textAlign: "center" }}>{isOpen ? "−" : "+"}</span>
                    </button>
                    {isOpen && (
                      <div className="drawer-subs">
                        {s.subs.map((sub) => (
                          <Link key={sub} href={sectionHref(s.key, { sub })}>{sub}</Link>
                        ))}
                        <Link href={sectionHref(s.key)} style={{ fontSize: 15, fontWeight: 600, color: "var(--maroon)" }}>
                          Shop all {s.label.toLowerCase()} →
                        </Link>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <span style={{ marginTop: "auto", padding: 18, fontSize: 13.5, color: "var(--muted)", textAlign: "center" }}>
              Every piece painted by hand, never printed
            </span>
          </div>
          <button className="drawer-scrim" onClick={() => setDrawer(false)} aria-label="Close menu" />
        </div>
      )}

      <CartDrawer paymentsEnabled={paymentsEnabled} />
    </div>
  );
}
