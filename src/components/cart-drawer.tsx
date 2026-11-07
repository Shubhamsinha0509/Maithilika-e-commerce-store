"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { MAX_QTY, useCart } from "@/components/cart";
import { inr, productHref, SHIPPING } from "@/lib/store";
import { useScrollLock } from "@/lib/use-scroll-lock";

/** "Added to bag" note: shows for a few seconds after each add, with a way into the bag. */
export function AddedToBag() {
  const { justAdded, dismissAdded, open, count } = useCart();
  const n = justAdded?.n;
  useEffect(() => {
    if (!n) return;
    const t = setTimeout(dismissAdded, 4000);
    return () => clearTimeout(t);
    // A new add (a new n) restarts the timer.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n]);

  return (
    <div className="added-note-region" role="status" aria-live="polite">
      {justAdded && (
        <div key={justAdded.n} className="added-note">
          <span className="added-thumb">
            <Image src={justAdded.line.image} alt="" fill sizes="96px" className="crop-img" style={{ width: justAdded.line.crop.width, objectPosition: justAdded.line.crop.position }} />
          </span>
          <span className="added-text">
            <strong>Added to bag</strong>
            <span>{justAdded.line.name}</span>
          </span>
          <button type="button" className="added-view" onClick={open}>
            View bag{count > 0 ? ` (${count})` : ""}
          </button>
          <button type="button" className="added-close" onClick={dismissAdded} aria-label="Close">×</button>
        </div>
      )}
    </div>
  );
}

export function CartDrawer({ paymentsEnabled }: { paymentsEnabled: boolean }) {
  const { lines, count, subtotal, isOpen, close, setQty, remove } = useCart();
  useScrollLock(isOpen);
  if (!isOpen) return null;

  return (
    <div className="drawer-layer" style={{ zIndex: 110 }}>
      <button className="drawer-scrim" onClick={close} aria-label="Close bag" />
      <aside role="dialog" aria-label="Your bag" className="cart-panel">
        <div className="panel-head">
          <span className="panel-title">
            <span className="display" style={{ fontSize: 24 }}>Your bag</span>
            <span style={{ fontSize: 14, color: "var(--gold-light)" }}>{count === 1 ? "1 piece" : `${count} pieces`}</span>
          </span>
          <button onClick={close} aria-label="Close bag" className="panel-close">×</button>
        </div>
        <div className="dot-band" style={{ borderTop: "none", flex: "none" }} />

        {lines.length === 0 ? (
          <div className="cart-empty">
            <span className="display" style={{ fontSize: 24, color: "var(--brand)" }}>Your bag is empty</span>
            <span style={{ fontSize: 15.5, color: "var(--muted)", maxWidth: "30ch" }}>Every saree is painted by hand. Find the one with your story.</span>
            <Link href="/clothing?sub=Sarees" onClick={close} className="btn btn-primary" style={{ marginTop: 6, minHeight: 48 }}>
              Shop sarees
            </Link>
          </div>
        ) : (
          <>
            <ul className="cart-lines">
              {lines.map((l) => (
                <li key={l.key} className="cart-line">
                  <Link href={productHref(l.id)} onClick={close} className="cart-thumb">
                    <Image src={l.image} alt="" fill sizes="160px" style={{ width: l.crop.width, objectPosition: l.crop.position }} />
                  </Link>
                  <div style={{ display: "flex", flexDirection: "column", gap: 3, minWidth: 0 }}>
                    <Link href={productHref(l.id)} onClick={close} className="cart-name">{l.name}</Link>
                    {l.option && <span style={{ fontSize: 13.5, color: "var(--muted)" }}>{l.option}</span>}
                    <span style={{ fontWeight: 600, fontSize: 15.5 }}>
                      {l.qty > 1 ? `${inr(l.price)} × ${l.qty} = ${inr(l.price * l.qty)}` : inr(l.price)}
                    </span>
                    <div className="cart-line-actions">
                      {l.madeToOrder ? (
                        <div role="group" aria-label="Quantity" className="stepper">
                          <button onClick={() => setQty(l.key, l.qty - 1)} aria-label="Decrease quantity">−</button>
                          <span aria-live="polite">{l.qty}</span>
                          <button onClick={() => setQty(l.key, l.qty + 1)} disabled={l.qty >= MAX_QTY} aria-label="Increase quantity">+</button>
                        </div>
                      ) : (
                        <span style={{ fontSize: 13, color: "var(--muted)" }}>One of a kind</span>
                      )}
                      <button onClick={() => remove(l.key)} className="link-button">Remove</button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="cart-foot">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontSize: 16, fontWeight: 600 }}>Subtotal</span>
                <span style={{ fontSize: 20, fontWeight: 700 }}>{inr(subtotal)}</span>
              </div>
              <span style={{ fontSize: 13.5, color: "var(--muted)" }}>
                Free shipping across India above {inr(SHIPPING.freeAboveRupees)}.
              </span>
              {paymentsEnabled ? (
                <Link href="/checkout" onClick={close} className="btn btn-primary" style={{ minHeight: 52, fontSize: 17 }}>
                  Checkout
                </Link>
              ) : (
                <button className="btn btn-primary" disabled style={{ minHeight: 52, fontSize: 17 }}>
                  Checkout opens soon
                </button>
              )}
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
