/**
 * Store constants and the Product shape. Safe to import from client and
 * server code: no database access here (see catalog.ts for that).
 */

export type SectionKey = "clothing" | "homedecor" | "paintings" | "accessories";

export type View = [label: string, x: number, y: number, w: number, h: number];

/** Crop geometry for collage photos, copied from Design/sarees.js. */
export type ImageLayout = {
  iw: number;
  ih: number;
  ar: number;
  cardW?: string;
  cardPos?: string;
  views?: View[];
};

export type Product = {
  id: string;
  name: string;
  section: SectionKey;
  sub: string;
  price: number;
  motif: string;
  motifHi: string | null;
  motifText: string | null;
  fabric: string | null;
  colour: string | null;
  style: string | null;
  medium: string | null;
  frame: string | null;
  edge: string | null;
  includes: string | null;
  optionLabel: string | null;
  options: string[];
  image: string;
  layout: ImageLayout;
  artistName: string | null;
  artistVillage: string | null;
  paintedDays: number | null;
  madeToOrder: boolean;
  leadTimeDays: number | null;
  sold: boolean;
  position: number;
};

export type Section = {
  key: SectionKey;
  slug: string;
  label: string;
  hi: string;
  subs: string[];
  intro: string;
  photo: string;
  /** Product ids shown as "Featured pieces" in the header menu. */
  featured: string[];
};

export const SECTIONS: Section[] = [
  {
    key: "clothing",
    slug: "clothing",
    label: "Clothing",
    hi: "वस्त्र",
    subs: ["Sarees", "Dupattas", "Kurtas & Kurtis", "Stoles"],
    intro: "Sarees, dupattas, kurtas and stoles painted by hand on silk and cotton. Every piece names the artist who painted it.",
    photo: "/images/home/arrival-kurta.jpg",
    featured: ["saree-7", "saree-3", "saree-2"],
  },
  {
    key: "homedecor",
    slug: "home-decor",
    label: "Home Decor",
    hi: "गृह सज्जा",
    subs: ["Wall hangings", "Cushion covers", "Table linen", "Bed linen"],
    intro: "Wall hangings, cushion covers, table linen and bed linen painted by hand, for rooms that tell a story.",
    photo: "/images/home/section-homedecor.jpg",
    featured: ["tablelinen-1", "wallhanging-1", "bedsheet-2"],
  },
  {
    key: "paintings",
    slug: "paintings",
    label: "Paintings",
    hi: "चित्र",
    subs: ["On paper", "On canvas", "Framed"],
    intro: "Original Mithila paintings on handmade paper and canvas, unframed or ready to hang. Each one is signed by its artist on the reverse.",
    photo: "/images/home/section-paintings.jpg",
    featured: ["painting-3", "painting-4", "painting-1"],
  },
  {
    key: "accessories",
    slug: "accessories",
    label: "Accessories",
    hi: "एक्सेसरीज़",
    subs: ["Bags", "Handkerchiefs", "Jewellery", "Scarves"],
    intro: "Bags, handkerchiefs, jewellery and scarves painted by hand, small enough to carry a motif with you every day.",
    photo: "/images/home/section-accessories.jpg",
    featured: ["tote-1", "scarf-1", "earrings-1"],
  },
];

export const sectionByKey = (key: string) => SECTIONS.find((s) => s.key === key);
export const sectionBySlug = (slug: string) => SECTIONS.find((s) => s.slug === slug);

export function sectionHref(key: SectionKey, query?: Record<string, string>) {
  const slug = sectionByKey(key)?.slug ?? key;
  const qs = query ? "?" + new URLSearchParams(query).toString() : "";
  return `/${slug}${qs}`;
}

export const productHref = (id: string) => `/product/${id}`;

/** The four motifs the homepage explains, with images in public/images/motifs. */
export const MOTIFS = [
  { en: "Fish", hi: "मछली", meaning: "Good fortune and fertility. Fish are painted in pairs for weddings and new beginnings." },
  { en: "Lotus", hi: "कमल", meaning: "Purity and prosperity. The lotus rises clean from muddy water." },
  { en: "Sun", hi: "सूर्य", meaning: "Life and energy. A face with radiating rays, often at the centre of a piece." },
  { en: "Peacock", hi: "मोर", meaning: "Love and devotion. Peacocks often appear in pairs, facing each other." },
];

export const motifImage = (motif: string) =>
  MOTIFS.some((m) => m.en === motif) ? `/images/motifs/${motif.toLowerCase()}.jpg` : null;

export const COLOUR_SWATCHES: Record<string, string> = {
  Ivory: "#F3EAD3",
  Beige: "#D9C7A4",
  Gold: "#C9A24B",
  Silver: "#C8C6C0",
  Rust: "#A8532A",
  Grey: "#B9B7B2",
  Black: "#1A1410",
};

/**
 * PLACEHOLDERS: the owner has not set real numbers yet (docs/plan.md).
 * Replace before checkout goes live.
 */
export const SHIPPING = {
  feeRupees: 99,
  freeAboveRupees: 2999,
};

export const inr = (n: number) => "₹" + n.toLocaleString("en-IN");

export function shippingFor(subtotal: number) {
  return subtotal === 0 || subtotal >= SHIPPING.freeAboveRupees ? 0 : SHIPPING.feeRupees;
}

/** Card framing: paintings are shown whole; textiles are cropped from collages. */
export function cardCrop(p: Pick<Product, "section" | "layout">) {
  if (p.section === "paintings") return { width: "100%", position: "50% 50%", fit: "contain" as const };
  return { width: p.layout.cardW ?? "160.8%", position: p.layout.cardPos ?? "0 3%", fit: "cover" as const };
}

/** Tile and menu framing: always cover, using the collage crop. */
export function tileCrop(p: Pick<Product, "layout">) {
  return { width: p.layout.cardW ?? "160.8%", position: p.layout.cardPos ?? "0 3%" };
}

export function circleCrop(p: Pick<Product, "section" | "layout">) {
  if (p.section === "paintings") return { width: Math.max(100, 100 * p.layout.ar) + "%", position: "50% 50%" };
  return { width: Math.max(100, parseFloat(p.layout.cardW ?? "160.8") * 0.75) + "%", position: p.layout.cardPos ?? "0 3%" };
}

export const availabilityLabel = (p: Pick<Product, "madeToOrder">) => (p.madeToOrder ? "Made to order" : "Ready to ship");

/** Second line on product cards, as in Design/Listing.dc.html. */
export function cardMeta(p: Product) {
  if (p.section === "paintings") return [p.medium, p.style, p.frame].filter(Boolean).join(" · ");
  return [p.fabric, p.style].filter(Boolean).join(" · ");
}
