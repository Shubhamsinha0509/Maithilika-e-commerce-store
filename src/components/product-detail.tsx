"use client";

import { useState, type CSSProperties } from "react";
import { useCart } from "@/components/cart";
import { WishlistButton } from "@/components/wishlist";
import type { DetailTab } from "@/lib/product-details";
import type { ImageLayout, Product, View } from "@/lib/store";

/**
 * Renders one crop rectangle of a collage photo as a background image,
 * padding with a neutral band when the crop's shape differs from the frame.
 * Ported from crop() in Design/Product.dc.html.
 */
function cropStyle(image: string, layout: ImageLayout, view: View, extra?: CSSProperties): CSSProperties {
  const W0 = layout.iw, H0 = layout.ih, A = layout.ar, BG = "#DAC9B5";
  let [, x, y, w, h] = view;
  const ox = x, oy = y, ow = w, oh = h;
  if (w / h < A - 0.005) { const nw = h * A; x -= (nw - w) / 2; w = nw; }
  else if (w / h > A + 0.005) { const nh = w / A; y -= (nh - h) / 2; h = nh; }
  const pos = (o: number, s: number, S: number) => (Math.abs(S - s) < 0.5 ? 0 : (o / (S - s)) * 100);
  const layers: string[] = [], sizes: string[] = [], positions: string[] = [];
  const band = `linear-gradient(to bottom,${BG},${BG})`;
  if (ow !== w) {
    const a = ((ox - x) / w) * 100, b = ((ox + ow - x) / w) * 100;
    if (a > 0) { layers.push(band); sizes.push(`${a + 0.2}% 100%`); positions.push("0 0"); }
    if (b < 100) { layers.push(band); sizes.push(`${100 - b + 0.2}% 100%`); positions.push("100% 0"); }
  }
  if (oh !== h) {
    const a = ((oy - y) / h) * 100, b = ((oy + oh - y) / h) * 100;
    layers.push(`linear-gradient(to bottom,${BG} ${a}%,transparent ${a}%,transparent ${b}%,${BG} ${b}%)`);
    sizes.push("100% 100%");
    positions.push("0 0");
  }
  layers.push(`url("${image}")`);
  sizes.push(`${(W0 / w) * 100}% ${(H0 / h) * 100}%`);
  positions.push(`${pos(x, w, W0)}% ${pos(y, h, H0)}%`);
  return {
    display: "block",
    width: "100%",
    aspectRatio: String(A),
    backgroundImage: layers.join(","),
    backgroundRepeat: "no-repeat",
    backgroundColor: layers.length > 1 ? BG : "#F3EAD3",
    backgroundSize: sizes.join(","),
    backgroundPosition: positions.join(","),
    ...extra,
  };
}

export function Gallery({ p }: { p: Product }) {
  const views: View[] = p.layout.views?.length ? p.layout.views : [["Full view", 0, 0, p.layout.iw, p.layout.ih]];
  const [index, setIndex] = useState(0);
  const current = views[index] ?? views[0];

  return (
    <div className="gallery">
      {views.length > 1 && (
        <div role="tablist" aria-label="Product images" className="gallery-thumbs">
          {views.map((v, i) => (
            <button
              key={v[0]}
              role="tab"
              aria-selected={i === index}
              aria-label={v[0]}
              onClick={() => setIndex(i)}
              className={i === index ? "thumb is-on" : "thumb"}
              style={{ aspectRatio: String(p.layout.ar) }}
            >
              <span style={cropStyle(p.image, p.layout, v, { height: "100%" })} />
            </button>
          ))}
        </div>
      )}
      <div className="gallery-main">
        <div role="img" aria-label={`${p.name}: ${current[0]}`} style={cropStyle(p.image, p.layout, current)} />
        <span className="badge-painted" style={{ left: 20, top: 20, fontSize: 11 }}>Hand-painted</span>
        {views.length > 1 && <span className="view-label">{current[0]}</span>}
      </div>
    </div>
  );
}

export function BuyBox({ p }: { p: Product }) {
  const { add } = useCart();
  const [choice, setChoice] = useState<number | null>(null);
  const [added, setAdded] = useState(false);
  const mustChoose = p.optionLabel === "Size" && p.options.length > 1;

  if (p.sold) {
    return (
      <div className="sold-note">
        <button className="btn btn-primary" disabled style={{ width: "100%", minHeight: 54, fontSize: 17 }}>Sold</button>
        <p style={{ margin: 0, fontSize: 15, color: "var(--muted)", textAlign: "center" }}>
          This one-of-a-kind piece has found its home.
        </p>
      </div>
    );
  }

  const label = added ? "Added to bag" : choice === null && mustChoose ? "Select a size" : "Add to bag";

  return (
    <>
      {p.optionLabel && p.options.length > 0 && (
        <fieldset style={{ border: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
          <legend style={{ fontWeight: 600, fontSize: 15.5, padding: 0, marginBottom: 10 }}>{p.optionLabel}</legend>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {p.options.map((o, i) => (
              <button key={o} onClick={() => { setChoice(i); setAdded(false); }} aria-pressed={choice === i} className="option-btn">
                {o}
              </button>
            ))}
          </div>
        </fieldset>
      )}
      <div style={{ display: "flex", gap: 10 }}>
        <button
          className="btn btn-primary"
          style={{ minHeight: 54, fontSize: 17, flex: 1 }}
          disabled={choice === null && mustChoose}
          onClick={() => {
            add(p, p.options[choice ?? 0] ?? null);
            setAdded(true);
          }}
        >
          {label}
        </button>
        <WishlistButton id={p.id} variant="detail" />
      </div>
    </>
  );
}

export function DetailsAccordion({ tabs }: { tabs: DetailTab[] }) {
  const [open, setOpen] = useState(0);
  return (
    <div className="details">
      {tabs.map((t, i) => (
        <div key={t.title} style={{ borderBottom: "1px solid var(--line)" }}>
          <button className="details-toggle" aria-expanded={open === i} onClick={() => setOpen(open === i ? -1 : i)}>
            {t.title}
            <span style={{ fontSize: 22, color: "var(--maroon)" }}>{open === i ? "−" : "+"}</span>
          </button>
          {open === i && (
            <dl className="details-rows">
              {t.rows.map((r) => (
                <div key={r.k} style={{ display: "contents" }}>
                  <dt>{r.k}</dt>
                  <dd>{r.v}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      ))}
    </div>
  );
}
