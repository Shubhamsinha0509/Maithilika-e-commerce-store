import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ProductCard } from "@/components/product-card";
import { BuyBox, DetailsAccordion, Gallery } from "@/components/product-detail";
import { getProduct, getProducts } from "@/lib/catalog";
import { detailTabs } from "@/lib/product-details";
import { inr, motifImage, sectionByKey, sectionHref } from "@/lib/store";

export async function generateStaticParams() {
  return (await getProducts()).map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: PageProps<"/product/[id]">) {
  const p = await getProduct((await params).id);
  return p ? { title: p.name, description: p.motifText ?? undefined } : {};
}

// params is read inside <Suspense> (in ProductContent), not here: a refresh
// after a sale re-renders this route, and a top-level read makes that fail.
export default function ProductPage(props: PageProps<"/product/[id]">) {
  return (
    <Suspense fallback={<div className="wrap" style={{ minHeight: "60vh" }} />}>
      <ProductContent {...props} />
    </Suspense>
  );
}

async function ProductContent({ params }: PageProps<"/product/[id]">) {
  const p = await getProduct((await params).id);
  if (!p) notFound();

  const section = sectionByKey(p.section)!;
  const all = await getProducts();
  const more = all
    .filter((x) => x.id !== p.id && !x.sold)
    .sort((a, b) => Number(b.section === p.section) - Number(a.section === p.section))
    .slice(0, 4);
  const motifPic = motifImage(p.motif);

  return (
    <>
      <nav aria-label="Breadcrumb" className="wrap crumbs" style={{ paddingTop: 18 }}>
        <Link href="/">Home</Link><span aria-hidden="true">/</span>
        <Link href={sectionHref(p.section)}>{section.label}</Link><span aria-hidden="true">/</span>
        <Link href={sectionHref(p.section, { sub: p.sub })}>{p.sub}</Link><span aria-hidden="true">/</span>
        <span aria-current="page">{p.name}</span>
      </nav>

      <section className="wrap product-layout">
        <Gallery p={p} />

        <div style={{ display: "flex", flexDirection: "column", gap: 20, minWidth: 0 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <span className="eyebrow" style={{ letterSpacing: ".14em" }}>{section.label} · {p.sub}</span>
            <h1 className="display product-title">{p.name}</h1>
            {p.artistName && (
              <span style={{ fontSize: 16, color: "var(--muted)" }}>
                Painted by <strong style={{ color: "var(--maroon)" }}>{p.artistName}</strong>
                {p.artistVillage && `, ${p.artistVillage}, Bihar`}
              </span>
            )}
          </div>

          <dl className="facts">
            <div><dt>Motif</dt><dd>{p.motif} {p.motifHi && <span className="display" style={{ fontWeight: 400, color: "var(--maroon)" }}>{p.motifHi}</span>}</dd></div>
            <div><dt>Style</dt><dd>{p.style}</dd></div>
            {p.paintedDays && <div><dt>Painted over</dt><dd>{p.paintedDays} days</dd></div>}
          </dl>

          <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
            <span style={{ fontSize: 28, fontWeight: 600 }}>{inr(p.price)}</span>
            {p.sold ? (
              <span className="badge badge-sold" style={{ fontSize: 12, padding: "7px 10px 6px" }}>Sold</span>
            ) : p.madeToOrder ? (
              <span className="badge badge-mto" style={{ fontSize: 12, padding: "7px 10px 6px" }}>
                Made to order{p.leadTimeDays ? ` · ships in ${p.leadTimeDays} days` : ""}
              </span>
            ) : (
              <span className="badge badge-ready" style={{ fontSize: 12, padding: "7px 10px 6px" }}>Ready to ship</span>
            )}
          </div>

          <BuyBox p={p} />
          <DetailsAccordion tabs={detailTabs(p)} />
        </div>
      </section>

      {p.motifText && (
        <section style={{ background: "var(--sand)" }}>
          <div className="dot-band" />
          <div className="wrap" style={{ paddingBlock: "clamp(40px, 5vw, 64px)" }}>
            <article aria-labelledby="motif-name" className="on-dark motif-feature">
              {motifPic && (
                <div className="circle-frame" style={{ width: 150, flex: "none" }}>
                  <div className="circle-inner">
                    <Image src={motifPic} alt={`${p.motif} motif`} fill sizes="150px" style={{ objectFit: "cover" }} />
                  </div>
                </div>
              )}
              <div style={{ flex: "1 1 220px", display: "flex", flexDirection: "column", gap: 8 }}>
                <span className="eyebrow" style={{ fontSize: 12.5, letterSpacing: ".14em" }}>What the motif means</span>
                <h2 id="motif-name" style={{ margin: 0, display: "flex", gap: 12, alignItems: "baseline" }}>
                  <span className="display" style={{ fontSize: 30 }}>{p.motif}</span>
                  {p.motifHi && <span className="display" style={{ fontSize: 22, color: "var(--gold-light)" }}>{p.motifHi}</span>}
                </h2>
                <p className="lede" style={{ fontSize: 15.5 }}>{p.motifText}</p>
                <Link href={sectionHref(p.section, { motif: p.motif })} className="text-link" style={{ color: "var(--gold-light)" }}>
                  More pieces with this motif →
                </Link>
              </div>
            </article>
          </div>
        </section>
      )}

      <section aria-labelledby="more-title" className="wrap" style={{ paddingBlock: "clamp(48px, 6vw, 80px)", display: "flex", flexDirection: "column", gap: 24 }}>
        <h2 id="more-title" className="section-title" style={{ fontSize: "clamp(28px, 3vw, 38px)" }}>You may also like</h2>
        <div className="product-grid">
          {more.map((x) => <ProductCard key={x.id} p={x} />)}
        </div>
      </section>
    </>
  );
}
