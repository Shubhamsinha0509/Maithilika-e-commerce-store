import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Listing } from "@/components/listing";
import { ProductCard } from "@/components/product-card";
import { getSectionProducts } from "@/lib/catalog";
import { SECTIONS, sectionBySlug } from "@/lib/store";

export function generateStaticParams() {
  return SECTIONS.map((s) => ({ section: s.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[section]">) {
  const section = sectionBySlug((await params).section);
  return section ? { title: section.label, description: section.intro } : {};
}

// params is read inside <Suspense> (in SectionContent), not here: a refresh
// after a sale re-renders this route, and a top-level read makes that fail.
export default function SectionPage(props: PageProps<"/[section]">) {
  return (
    <Suspense fallback={<div className="wrap" style={{ minHeight: "60vh" }} />}>
      <SectionContent {...props} />
    </Suspense>
  );
}

async function SectionContent({ params }: PageProps<"/[section]">) {
  const section = sectionBySlug((await params).section);
  if (!section) notFound();
  const products = await getSectionProducts(section.key);

  return (
    <>
      <section className="on-dark" style={{ background: "var(--brand)", color: "var(--ivory)" }}>
        <div className="wrap listing-hero">
          <div style={{ display: "flex", flexDirection: "column", gap: 12, flex: "1 1 420px", maxWidth: 720 }}>
            <nav aria-label="Breadcrumb" className="crumbs on-dark-crumbs">
              <Link href="/">Home</Link>
              <span aria-hidden="true">/</span>
              <span aria-current="page">{section.label}</span>
            </nav>
            <h1 style={{ margin: 0, display: "flex", alignItems: "baseline", gap: 16, flexWrap: "wrap" }}>
              <span className="display" style={{ fontSize: "clamp(38px, 5vw, 64px)", lineHeight: 1.02 }}>{section.label}</span>
              <span className="display" style={{ fontSize: "clamp(20px, 2.4vw, 30px)", color: "var(--gold-light)" }}>{section.hi}</span>
            </h1>
            <p className="lede" style={{ maxWidth: "60ch" }}>{section.intro}</p>
          </div>
          <span className="count-chip">{products.length} hand-painted pieces</span>
        </div>
        <div className="dot-band" />
      </section>

      {/* The filters read ?sub= and ?motif= from the URL, so they render on the client. */}
      <Suspense
        fallback={
          <div className="wrap" style={{ paddingBlock: "32px 72px" }}>
            <div className="product-grid">
              {products.slice(0, 12).map((p) => <ProductCard key={p.id} p={p} />)}
            </div>
          </div>
        }
      >
        <Listing section={section.key} products={products} />
      </Suspense>
    </>
  );
}
