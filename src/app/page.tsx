import Image from "next/image";
import Link from "next/link";
import { ArrivalsTabs } from "@/components/arrivals-tabs";
import { getProducts } from "@/lib/catalog";
import { inr, MOTIFS, SECTIONS, sectionHref, SHIPPING, type SectionKey } from "@/lib/store";

const ARRIVAL_IDS = ["saree-7", "saree-3", "dupatta-1", "painting-3", "kurta-2", "cushion-2", "painting-17", "tote-1"];

// One photo per category. Crops show the subject: the saree photo has detail
// shots on its right, so only its main picture (the left 60%) is shown.
const CATEGORY_CARDS: { key: SectionKey; src: string; width: number; height: number; cropWidth: string; left: string; position: string }[] = [
  { key: "clothing", src: "/images/sarees/saree-3.jpg", width: 1145, height: 1374, cropWidth: "166%", left: "0", position: "0 6%" },
  { key: "homedecor", src: "/images/home/arrival-cushion.jpg", width: 356, height: 475, cropWidth: "100%", left: "0", position: "50% 50%" },
  { key: "paintings", src: "/images/home/arrival-peacock.jpg", width: 356, height: 475, cropWidth: "100%", left: "0", position: "50% 50%" },
  { key: "accessories", src: "/images/accessories/earrings-1.jpg", width: 1254, height: 1254, cropWidth: "100%", left: "0", position: "35% 50%" },
];

const STEPS = [
  { num: "१", title: "Sketch", img: "/images/home/step-sketch.jpg", text: "The artist draws the composition freehand, usually starting with the central figure and working outwards." },
  { num: "२", title: "Outline", img: "/images/home/step-outline.jpg", text: "Lines are inked with a fine nib or bamboo stick. In Kachni work, the line itself carries the whole design." },
  { num: "३", title: "Colour", img: "/images/home/step-colour.jpg", text: "Shapes are filled with flat, bright colour. In Bharni work, these bold fills give the piece its weight." },
  { num: "४", title: "Border", img: "/images/home/step-border.jpg", text: "A double-line border, often filled with dots, petals or a repeating pattern, closes the painting." },
];

export default async function HomePage() {
  const products = await getProducts();
  const arrivals = products.filter((p) => ARRIVAL_IDS.includes(p.id));

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
          <div className="hero-actions" style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 6 }}>
            <Link href="/clothing" className="btn btn-primary">Shop clothing <span className="btn-arrow" aria-hidden="true">→</span></Link>
            <Link href="/custom-order" className="btn btn-outline">Custom order</Link>
          </div>
        </div>
      </section>

      <section aria-label="Our promise" className="promise-band">
        <ul className="wrap promise-list">
          {[
            { icon: "brush", title: "100% hand-painted", text: "No prints, no stencils. Every line is drawn by hand." },
            { icon: "parcel", title: "Ships across India", text: `Free on orders above ${inr(SHIPPING.freeAboveRupees)}.` },
            { icon: "spark", title: "Made to order", text: "Some pieces are painted for you after you order." },
          ].map((p) => (
            <li key={p.title} className="promise">
              <span className="promise-icon" aria-hidden="true">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  {p.icon === "brush" && (
                    <>
                      <path d="M20 4 11.6 12.4" />
                      <path d="M11.6 12.4c-2.4-.6-4.6.9-5.1 3.4-.4 1.9-1.4 2.9-3 3.5 3 1.1 6.6.6 8.3-1.5 1.2-1.5 1.1-3.6-.2-5.4Z" />
                    </>
                  )}
                  {p.icon === "parcel" && (
                    <>
                      <path d="M3.5 7.5 12 3.5l8.5 4v9L12 20.5l-8.5-4Z" />
                      <path d="M3.5 7.5 12 11.5l8.5-4M12 11.5v9" />
                    </>
                  )}
                  {p.icon === "spark" && (
                    <>
                      <path d="M11 3.5 12.7 8l4.5 1.7-4.5 1.7L11 16l-1.7-4.6L4.8 9.7 9.3 8Z" />
                      <path d="M18 14.5l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8Z" />
                    </>
                  )}
                </svg>
              </span>
              <span className="promise-words">
                <span className="promise-title">{p.title}</span>
                <span className="promise-text">{p.text}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="category-title" className="wrap category-section">
        <h2 id="category-title" className="section-title title-ruled">Shop by Category</h2>
        <div className="category-grid">
          {CATEGORY_CARDS.map((c) => {
            const s = SECTIONS.find((x) => x.key === c.key)!;
            return (
              <Link key={c.key} href={sectionHref(c.key)} className="category-card">
                <span className="category-photo">
                  <Image
                    src={c.src}
                    alt=""
                    width={c.width}
                    height={c.height}
                    sizes="(max-width: 899px) 46vw, 320px"
                    className="crop-img"
                    style={{ width: c.cropWidth, left: c.left, objectPosition: c.position }}
                  />
                </span>
                <span className="category-name">
                  <span className="display">{s.label}</span>
                  <span className="category-hi">{s.hi}</span>
                </span>
              </Link>
            );
          })}
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
