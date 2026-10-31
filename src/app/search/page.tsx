import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ProductCard } from "@/components/product-card";
import { getProducts } from "@/lib/catalog";
import { sectionByKey } from "@/lib/store";

export const metadata: Metadata = { title: "Search" };

export default function SearchPage({ searchParams }: PageProps<"/search">) {
  return (
    <section className="wrap" style={{ paddingBlock: "clamp(32px, 5vw, 56px) 72px", display: "flex", flexDirection: "column", gap: 24, minHeight: "50vh" }}>
      <Suspense fallback={<h1 className="section-title">Searching…</h1>}>
        <Results query={searchParams.then((s) => (typeof s.q === "string" ? s.q.trim() : ""))} />
      </Suspense>
    </section>
  );
}

async function Results({ query }: { query: Promise<string> }) {
  const q = await query;
  const words = q.toLowerCase().split(/\s+/).filter(Boolean);
  const products = await getProducts();
  // Every word must appear somewhere in the piece's searchable text.
  const matches = words.length
    ? products.filter((p) => {
        const text = [p.name, p.motif, p.motifHi, p.fabric, p.colour, p.style, p.medium, p.sub, sectionByKey(p.section)?.label]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return words.every((w) => text.includes(w));
      })
    : [];

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <span className="eyebrow">Search</span>
        <h1 className="section-title">{q ? `“${q}”` : "Search the shop"}</h1>
        <p className="lede">
          {!q ? "Type a fabric, motif or piece name in the search box above." : matches.length === 1 ? "1 piece found" : `${matches.length} pieces found`}
        </p>
      </div>
      {q && matches.length === 0 && (
        <div className="empty-state">
          <span className="display" style={{ fontSize: 26, color: "var(--indigo)" }}>Nothing matched</span>
          <span style={{ fontSize: 15.5, color: "var(--muted)" }}>Try a motif such as “peacock” or a fabric such as “silk”.</span>
          <Link href="/clothing" className="btn btn-outline" style={{ minHeight: 46, marginTop: 6 }}>Browse clothing</Link>
        </div>
      )}
      <div className="product-grid">
        {matches.map((p) => <ProductCard key={p.id} p={p} />)}
      </div>
    </>
  );
}
