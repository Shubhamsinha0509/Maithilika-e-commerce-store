"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { ProductCard } from "@/components/product-card";
import { OPEN_MENU_EVENT } from "@/components/site-header";
import { COLOUR_SWATCHES, sectionByKey, tileCrop, type Product, type SectionKey } from "@/lib/store";

type GroupKey = "motif" | "style" | "fabric" | "medium" | "frame" | "price" | "avail" | "colour";

const GROUP_TITLES: Record<GroupKey, string> = {
  motif: "Motif",
  style: "Painting style",
  fabric: "Fabric",
  medium: "Medium",
  frame: "Framing",
  price: "Price",
  avail: "Availability",
  colour: "Colour",
};

const GROUPS: Record<SectionKey, GroupKey[]> = {
  clothing: ["motif", "style", "fabric", "price", "avail", "colour"],
  paintings: ["motif", "style", "medium", "frame", "price", "avail"],
  homedecor: ["motif", "fabric", "price", "avail", "colour"],
  accessories: ["motif", "fabric", "price", "avail", "colour"],
};

/** Price bands per section, in rupees: [label, min, max). */
const PRICE_BANDS: Record<SectionKey, [string, number, number][]> = {
  clothing: [["Under ₹5,000", 0, 5000], ["₹5,000 to ₹10,000", 5000, 10000], ["Above ₹10,000", 10000, Infinity]],
  paintings: [["Under ₹6,500", 0, 6500], ["₹6,500 to ₹7,500", 6500, 7500], ["Above ₹7,500", 7500, Infinity]],
  homedecor: [["Under ₹3,000", 0, 3000], ["₹3,000 to ₹6,000", 3000, 6000], ["Above ₹6,000", 6000, Infinity]],
  accessories: [["Under ₹1,000", 0, 1000], ["₹1,000 to ₹2,000", 1000, 2000], ["Above ₹2,000", 2000, Infinity]],
};

const QUICK: Record<SectionKey, [GroupKey, string][]> = {
  clothing: [["avail", "Ready to ship"], ["motif", "Fish"], ["motif", "Peacock"], ["fabric", "Tissue silk"], ["fabric", "Linen cotton"]],
  paintings: [["avail", "Ready to ship"], ["frame", "Framed"], ["medium", "Canvas"], ["motif", "Peacock"]],
  homedecor: [["avail", "Ready to ship"], ["motif", "Lotus"], ["fabric", "Cotton"]],
  accessories: [["avail", "Ready to ship"], ["motif", "Fish"]],
};

const SORTS = [
  ["featured", "Featured"],
  ["new", "Newest first"],
  ["ready", "Ready to ship first"],
  ["mto", "Made to order first"],
  ["plh", "Price: low to high"],
  ["phl", "Price: high to low"],
] as const;
type Sort = (typeof SORTS)[number][0];

function valueOf(p: Product, g: GroupKey, section: SectionKey): string | null {
  switch (g) {
    case "avail":
      return p.sold ? "Sold" : p.madeToOrder ? "Made to order" : "Ready to ship";
    case "price":
      return PRICE_BANDS[section].find(([, min, max]) => p.price >= min && p.price < max)?.[0] ?? null;
    default:
      return p[g];
  }
}

/** Only offer filter values that at least one product actually has. */
function optionsFor(products: Product[], g: GroupKey, section: SectionKey) {
  if (g === "price") return PRICE_BANDS[section].map(([label]) => label).filter((l) => products.some((p) => valueOf(p, g, section) === l));
  return [...new Set(products.map((p) => valueOf(p, g, section)).filter((v): v is string => !!v))];
}

export function Listing(props: { section: SectionKey; products: Product[] }) {
  const params = useSearchParams();
  // Re-mount when the menu links to another ?sub= on this same page.
  return <ListingInner key={params.toString()} {...props} initialSub={params.get("sub")} initialMotif={params.get("motif")} />;
}

function ListingInner({ section, products, initialSub, initialMotif }: { section: SectionKey; products: Product[]; initialSub: string | null; initialMotif: string | null }) {
  const cfg = sectionByKey(section)!;
  const groups = GROUPS[section];
  const [sub, setSub] = useState<string | null>(initialSub);
  const [sel, setSel] = useState<Partial<Record<GroupKey, string[]>>>(initialMotif ? { motif: [initialMotif] } : {});
  const [collapsed, setCollapsed] = useState<Partial<Record<GroupKey, boolean>>>({});
  const [sort, setSort] = useState<Sort>("featured");
  const [count, setCount] = useState(12);
  const [sheet, setSheet] = useState(false);
  const [sortSheet, setSortSheet] = useState(false);

  const toggle = (g: GroupKey, v: string) => {
    setSel((s) => {
      const cur = s[g] ?? [];
      return { ...s, [g]: cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v] };
    });
    setCount(12);
  };
  const clearAll = () => {
    setSel({});
    setSub(null);
    setCount(12);
  };

  let items = products.filter(
    (p) => (!sub || p.sub === sub) && groups.every((g) => !(sel[g]?.length) || sel[g]!.includes(valueOf(p, g, section) ?? "")),
  );
  if (sort === "new") items = [...items].reverse();
  if (sort === "ready") items = [...items].sort((a, b) => Number(a.madeToOrder) - Number(b.madeToOrder));
  if (sort === "mto") items = [...items].sort((a, b) => Number(b.madeToOrder) - Number(a.madeToOrder));
  if (sort === "plh") items = [...items].sort((a, b) => a.price - b.price);
  if (sort === "phl") items = [...items].sort((a, b) => b.price - a.price);
  const shown = items.slice(0, count);

  const applied = [
    ...(sub ? [{ label: sub, remove: () => setSub(null) }] : []),
    ...groups.flatMap((g) => (sel[g] ?? []).map((v) => ({ label: v, remove: () => toggle(g, v) }))),
  ];
  const quick = QUICK[section].filter(([g, v]) => optionsFor(products, g, section).includes(v));

  return (
    <div className="listing">
      <section aria-label="Sub-categories" className="wrap" style={{ paddingBlock: "28px 8px" }}>
        <div className="sub-tiles">
          {cfg.subs.map((s) => {
            const p = products.find((x) => x.sub === s);
            const crop = p ? tileCrop(p) : null;
            const on = sub === s;
            return (
              <button key={s} aria-pressed={on} className={on ? "sub-tile is-on" : "sub-tile"} onClick={() => { setSub(on ? null : s); setCount(12); }}>
                <span className="arch">
                  <span className="arch-inner" style={{ aspectRatio: "3 / 3.8" }}>
                    {p && crop && (
                      // eslint-disable-next-line @next/next/no-img-element -- collage crop needs width > 100%
                      <img src={p.image} alt="" className="crop-img" style={{ width: crop.width, objectPosition: crop.position }} />
                    )}
                  </span>
                </span>
                <span className="sub-tile-label">{s}</span>
              </button>
            );
          })}
        </div>
      </section>

      <div className="wrap toolbar">
        <div role="group" aria-label="Quick filters" className="chip-row">
          {quick.map(([g, v]) => (
            <button key={g + v} aria-pressed={!!sel[g]?.includes(v)} onClick={() => toggle(g, v)} className="pill">
              {g === "motif" ? `${v} motif` : v}
            </button>
          ))}
        </div>
        <label className="sort-label">
          Sort by
          <select value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
            {SORTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </label>
      </div>

      <div className="wrap listing-body">
        {sheet && <button className="overlay" style={{ zIndex: 70 }} onClick={() => setSheet(false)} aria-label="Close filters" />}
        <aside aria-label="Filters" className={sheet ? "filters is-sheet" : "filters"}>
          <div className="sheet-head">
            <span className="display" style={{ fontSize: 22, color: "var(--indigo)" }}>Filter</span>
            <button onClick={() => setSheet(false)} aria-label="Close filters" className="panel-close" style={{ color: "var(--ink)" }}>×</button>
          </div>
          <div className="filters-panel">
            <div className="filters-top">
              <span style={{ fontWeight: 600, fontSize: 15, letterSpacing: ".12em", textTransform: "uppercase" }}>Filters</span>
              <button onClick={clearAll} className="link-button" style={{ fontSize: 14.5 }}>Clear all</button>
            </div>
            {groups.map((g) => {
              const open = !collapsed[g];
              const n = sel[g]?.length ?? 0;
              return (
                <fieldset key={g} className="filter-group">
                  <button className="filter-toggle" aria-expanded={open} onClick={() => setCollapsed((c) => ({ ...c, [g]: open }))}>
                    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {GROUP_TITLES[g]}
                      {n > 0 && <span className="filter-count">{n}</span>}
                    </span>
                    <span style={{ fontSize: 20, color: "var(--maroon)", width: 20, textAlign: "center" }}>{open ? "−" : "+"}</span>
                  </button>
                  {open && (
                    <div style={{ display: "flex", flexDirection: "column", paddingBottom: 12 }}>
                      {optionsFor(products, g, section).map((v) => (
                        <label key={v} className="filter-option">
                          <input type="checkbox" checked={!!sel[g]?.includes(v)} onChange={() => toggle(g, v)} />
                          {g === "colour" && COLOUR_SWATCHES[v] && <span className="swatch" style={{ background: COLOUR_SWATCHES[v] }} />}
                          <span style={{ flex: 1 }}>{v}</span>
                          {g === "motif" && (
                            <span className="display" style={{ fontSize: 14, color: "var(--maroon)" }}>
                              {products.find((p) => p.motif === v)?.motifHi}
                            </span>
                          )}
                        </label>
                      ))}
                    </div>
                  )}
                </fieldset>
              );
            })}
          </div>
          <div className="sheet-foot">
            <button onClick={clearAll} className="btn btn-outline" style={{ flex: 1, minHeight: 48 }}>Clear all</button>
            <button onClick={() => setSheet(false)} className="btn btn-primary" style={{ flex: 2, minHeight: 48 }}>Show {items.length} pieces</button>
          </div>
        </aside>

        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 22 }}>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px 10px", minHeight: 28 }}>
            <span style={{ fontSize: 15, color: "var(--muted)", marginRight: 6 }}>Showing {shown.length} of {items.length} pieces</span>
            {applied.map((a) => (
              <button key={a.label} onClick={a.remove} aria-label={`Remove filter ${a.label}`} className="applied-chip">
                {a.label}<span aria-hidden="true" style={{ fontSize: 17, lineHeight: 1 }}>×</span>
              </button>
            ))}
          </div>

          {items.length === 0 ? (
            <div className="empty-state">
              <span className="display" style={{ fontSize: 26, color: "var(--indigo)" }}>No pieces match these filters</span>
              <span style={{ fontSize: 15.5, color: "var(--muted)", maxWidth: "46ch" }}>Remove a filter to see more pieces.</span>
              <button onClick={clearAll} className="btn btn-outline" style={{ minHeight: 46, marginTop: 6 }}>Clear filters</button>
            </div>
          ) : (
            <div className="product-grid listing-grid">
              {shown.map((p) => <ProductCard key={p.id} p={p} />)}
            </div>
          )}

          {items.length > count && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, marginTop: 16 }}>
              <button onClick={() => setCount((c) => c + 8)} className="btn btn-outline" style={{ padding: "0 32px" }}>Load more pieces</button>
              <span style={{ fontSize: 13.5, color: "var(--muted)" }}>{shown.length} of {items.length} shown</span>
            </div>
          )}
        </div>
      </div>

      <nav aria-label="Listing actions" className="listing-bar">
        <button onClick={() => window.dispatchEvent(new Event(OPEN_MENU_EVENT))}>
          <span style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span className="bar-line" /><span className="bar-line" /><span className="bar-line" />
          </span>
          Menu
        </button>
        <button onClick={() => setSheet(true)}>
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18M6 12h12M10 18h4" stroke="#C9A24B" strokeWidth="1.8" strokeLinecap="round" /></svg>
          Filter
          {applied.length > 0 && <span className="bar-count">{applied.length}</span>}
        </button>
        <button onClick={() => setSortSheet(true)}>
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 4v16M8 20l-3.5-3.5M8 20l3.5-3.5M16 20V4M16 4l-3.5 3.5M16 4l3.5 3.5" stroke="#C9A24B" strokeWidth="1.8" strokeLinecap="round" fill="none" /></svg>
          Sort
        </button>
      </nav>

      {sortSheet && (
        <div className="drawer-layer" style={{ zIndex: 90, flexDirection: "column", justifyContent: "flex-end" }}>
          <button className="drawer-scrim" onClick={() => setSortSheet(false)} aria-label="Close sort" />
          <div role="radiogroup" aria-label="Sort by" className="sort-sheet">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", minHeight: 52 }}>
              <span className="display" style={{ fontSize: 22, color: "var(--indigo)" }}>Sort by</span>
              <button onClick={() => setSortSheet(false)} aria-label="Close sort" className="panel-close" style={{ color: "var(--ink)" }}>×</button>
            </div>
            {SORTS.map(([v, l]) => (
              <label key={v} className="sort-option">
                <input type="radio" name="sort" checked={sort === v} onChange={() => { setSort(v); setSortSheet(false); }} />
                {l}
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
