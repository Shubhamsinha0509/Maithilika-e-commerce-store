"use client";

import { useState } from "react";
import { ProductCard } from "@/components/product-card";
import { SECTIONS, type Product, type SectionKey } from "@/lib/store";

const TABS: { key: SectionKey | "all"; label: string }[] = [{ key: "all", label: "All" }, ...SECTIONS.map((s) => ({ key: s.key, label: s.label }))];

export function ArrivalsTabs({ products }: { products: Product[] }) {
  const [tab, setTab] = useState<SectionKey | "all">("all");
  const shown = products.filter((p) => tab === "all" || p.section === tab);

  return (
    <>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 16 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span className="eyebrow">New arrivals</span>
          <h2 id="new-title" className="section-title">Fresh off the artists’ tables</h2>
        </div>
        <div role="tablist" aria-label="Filter new arrivals" className="chip-row">
          {TABS.map((t) => (
            <button key={t.key} role="tab" aria-selected={tab === t.key} onClick={() => setTab(t.key)} className="pill">
              {t.label}
            </button>
          ))}
        </div>
      </div>
      <div className="product-grid">
        {shown.map((p) => (
          <ProductCard key={p.id} p={p} />
        ))}
      </div>
    </>
  );
}
