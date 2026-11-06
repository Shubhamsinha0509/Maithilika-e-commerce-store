import Image from "next/image";
import Link from "next/link";
import { ArrivalsTabs } from "@/components/arrivals-tabs";
import { getProducts } from "@/lib/catalog";
import { inr, MOTIFS, SECTIONS, sectionHref, SHIPPING, tileCrop, type Product } from "@/lib/store";

const ARRIVAL_IDS = ["saree-7", "saree-3", "dupatta-1", "painting-3", "kurta-2", "cushion-2", "painting-17", "tote-1"];

const STEPS = [
  { num: "१", title: "Sketch", img: "/images/home/step-sketch.jpg", text: "The artist draws the composition freehand, usually starting with the central figure and working outwards." },
  { num: "२", title: "Outline", img: "/images/home/step-outline.jpg", text: "Lines are inked with a fine nib or bamboo stick. In Kachni work, the line itself carries the whole design." },
  { num: "३", title: "Colour", img: "/images/home/step-colour.jpg", text: "Shapes are filled with flat, bright colour. In Bharni work, these bold fills give the piece its weight." },
  { num: "४", title: "Border", img: "/images/home/step-border.jpg", text: "A double-line border, often filled with dots, petals or a repeating pattern, closes the painting." },
];

export default async function HomePage() {
  const products = await getProducts();
  const clothing = SECTIONS[0];
  const others = SECTIONS.slice(1);
  const arrivals = products.filter((p) => ARRIVAL_IDS.includes(p.id));
  // The Sarees tile uses the peacock tissue saree, as in the design.
  const tileProduct = (sub: string): Product | undefined =>
    sub === "Sarees" ? products.find((p) => p.id === "saree-3") : products.find((p) => p.section === "clothing" && p.sub === sub);

  return (
    <>
      <section aria-label="Featured piece" className="hero-photo">
        <div className="hero-photo-img">
          <Image
            src="/images/home/hero-saree-hd.jpg"
            alt="A woman in a hand-painted Mithila saree with peacock and flower motifs, sitting beside a carved wooden door"
            fill
            priority
            sizes="100vw"
            quality={90}
          />
        </div>
        <div className="wrap hero-copy">
          <span className="eyebrow" style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ width: 28, height: 1.5, background: "currentColor", flex: "none" }} />
            Hand-painted Mithila art · मिथिला चित्रकला
          </span>
          <h1 className="display hero-title">Painted by hand. <span className="hero-title-accent">Worn like a story.</span></h1>
          <p className="lede hero-lede">
            Every saree, cushion and canvas is painted line by line by a Mithila artist. Each piece carries the meaning of its motif.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 6 }}>
            <Link href="/clothing" className="btn btn-primary">Shop clothing</Link>
            <Link href="#story" className="btn btn-outline">How it&apos;s painted</Link>
          </div>
        </div>
      </section>

      <section aria-label="Our promise" className="promise-band">
        <ul className="wrap promise-list">
          {[
            ["100% hand-painted", "No prints, no stencils. Every line is drawn by hand."],
            ["Shipping across India", `Free on orders above ${inr(SHIPPING.freeAboveRupees)}.`],
            ["Made to order", "Some pieces are painted for you after you order."],
          ].map(([title, text]) => (
            <li key={title} className="promise">
              <span className="promise-title">{title}</span>
              <span className="promise-text">{text}</span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="sections-title" className="wrap" style={{ paddingTop: "clamp(48px, 7vw, 96px)", display: "flex", flexDirection: "column", gap: 28 }}>
        <div className="centered-head">
          <span className="eyebrow">Shop the collection</span>
          <h2 id="sections-title" className="section-title">A painting that happens to be a saree</h2>
        </div>

        <article className="on-dark clothing-feature">
          <div style={{ flex: "1 1 300px", display: "flex", flexDirection: "column", gap: 16, justifyContent: "center", maxWidth: 420 }}>
            <span className="eyebrow" style={{ fontSize: 12.5 }}>The main collection</span>
            <h3 style={{ margin: 0, display: "flex", alignItems: "baseline", gap: 14, flexWrap: "wrap" }}>
              <span className="display" style={{ fontSize: "clamp(40px, 4.4vw, 60px)", lineHeight: 1 }}>Clothing</span>
              <span className="display" style={{ fontSize: 26, color: "var(--gold-light)" }}>वस्त्र</span>
            </h3>
            <p className="lede">Sarees, dupattas, kurtas and stoles painted on silk and cotton. Fish borders, lotus pallus and peacock vines.</p>
            <Link href="/clothing" className="btn btn-primary" style={{ alignSelf: "flex-start", marginTop: 4 }}>Shop all clothing</Link>
          </div>
          <div className="clothing-tiles">
            {clothing.subs.map((sub) => {
              const p = tileProduct(sub);
              const crop = p ? tileCrop(p) : null;
              return (
                <Link key={sub} href={sectionHref("clothing", { sub })} className="clothing-tile">
                  <span className="arch">
                    <span className="arch-inner" style={{ aspectRatio: "3 / 4.4", background: "var(--brand-stripe)" }}>
                      {p && crop && (
                        <Image src={p.image} alt={sub} fill sizes="(max-width: 760px) 70vw, 360px" className="crop-img" style={{ width: crop.width, objectPosition: crop.position }} />
                      )}
                    </span>
                  </span>
                  <span style={{ fontWeight: 600, fontSize: 17, textAlign: "center" }}>{sub}</span>
                </Link>
              );
            })}
          </div>
        </article>

        <div className="section-cards">
          {others.map((s) => (
            <article key={s.key} className="section-card">
              <Link href={sectionHref(s.key)} aria-label={s.label} className="arch">
                <span className="arch-inner" style={{ aspectRatio: "4 / 3" }}>
                  <Image src={s.photo} alt={s.label} fill sizes="(max-width: 760px) 90vw, 420px" style={{ objectFit: "cover" }} />
                </span>
              </Link>
              <h3 style={{ margin: 0, display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: "0 10px" }}>
                <span className="display" style={{ fontSize: 30, lineHeight: 1.1, color: "var(--brand)" }}>{s.label}</span>
                <span className="display" style={{ fontSize: 17, color: "var(--maroon)" }}>{s.hi}</span>
              </h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {s.subs.map((sub) => (
                  <Link key={sub} href={sectionHref(s.key, { sub })} className="pill sub-pill">{sub}</Link>
                ))}
              </div>
              <Link href={sectionHref(s.key)} className="text-link" style={{ marginTop: "auto" }}>
                Shop {s.label.toLowerCase()} →
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section id="motifs" aria-labelledby="motif-title" className="ornate" style={{ marginTop: "clamp(56px, 8vw, 104px)", background: "var(--grain), var(--sand)", scrollMarginTop: 20 }}>
        <div className="dot-band" />
        <div className="wrap" style={{ paddingBlock: "clamp(48px, 6vw, 80px)", display: "flex", flexDirection: "column", gap: 36 }}>
          <div className="centered-head">
            <span className="eyebrow">Shop by motif</span>
            <h2 id="motif-title" className="section-title">Every motif carries a meaning</h2>
            <p className="lede" style={{ maxWidth: "56ch" }}>
              Mithila painters have drawn the same few forms for generations. Choose the one whose meaning suits the person or the occasion.
            </p>
          </div>
          <div className="motif-grid">
            {MOTIFS.map((m) => (
              <Link key={m.en} href={sectionHref("clothing", { motif: m.en })} className="motif-card">
                <span className="circle-frame" style={{ width: 150 }}>
                  <span className="circle-inner">
                    <Image src={`/images/motifs/${m.en.toLowerCase()}.jpg`} alt={`${m.en} motif`} fill sizes="150px" style={{ objectFit: "cover" }} />
                  </span>
                </span>
                <span style={{ display: "flex", flexDirection: "column", gap: 2, alignItems: "center" }}>
                  <span className="display" style={{ fontSize: 28, lineHeight: 1.1, color: "var(--maroon)" }}>{m.hi}</span>
                  <span style={{ fontWeight: 600, fontSize: 17 }}>{m.en}</span>
                </span>
                <span style={{ fontSize: 15, lineHeight: 1.5, color: "var(--muted)" }}>{m.meaning}</span>
              </Link>
            ))}
          </div>
        </div>
        <div className="dot-band" />
      </section>

      <section aria-labelledby="new-title" className="wrap" style={{ paddingBlock: "clamp(56px, 7vw, 96px)", display: "flex", flexDirection: "column", gap: 26 }}>
        <ArrivalsTabs products={arrivals} />
        <Link href="/clothing" className="btn btn-outline" style={{ alignSelf: "center", padding: "0 28px" }}>See all new pieces</Link>
      </section>

      <section id="story" aria-labelledby="story-title" className="on-dark ornate" style={{ color: "var(--ivory)", scrollMarginTop: 20 }}>
        <div className="dot-band" />
        <div className="wrap" style={{ paddingBlock: "clamp(56px, 7vw, 96px)", display: "flex", flexDirection: "column", gap: 40 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 640 }}>
            <span className="eyebrow">Our story</span>
            <h2 id="story-title" className="section-title">How a piece is painted</h2>
            <p className="lede" style={{ marginTop: 6 }}>
              Mithila painting began on the walls and floors of homes in the Mithila region of Bihar and Nepal. Our artists use the same four steps on silk, cotton and paper.
            </p>
          </div>
          <ol className="steps">
            {STEPS.map((s) => (
              <li key={s.title} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ border: "1.5px solid var(--gold)", padding: 6 }}>
                  <Image src={s.img} alt={`${s.title} step`} width={384} height={300} sizes="(max-width: 760px) 90vw, 320px" style={{ display: "block", width: "100%", height: "auto", aspectRatio: "4 / 3", objectFit: "cover" }} />
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 12, borderBottom: "1px solid var(--brand-line)", paddingBottom: 10 }}>
                  <span className="display" style={{ fontSize: 34, lineHeight: 1, color: "var(--gold-light)" }}>{s.num}</span>
                  <h3 className="display" style={{ margin: 0, fontSize: 26 }}>{s.title}</h3>
                </div>
                <p style={{ margin: 0, fontSize: 15.5, lineHeight: 1.6, color: "var(--on-dark)" }}>{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}
