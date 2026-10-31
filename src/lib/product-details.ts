import type { Product } from "@/lib/store";

export type DetailTab = { title: string; rows: { k: string; v: string }[] };

const VARIES = "Hand-painted, so lines and colours vary slightly from the photos.";

const CARE_TEXTILE = [
  { k: "First wash", v: "Dry clean only for the first wash." },
  { k: "After that", v: "Hand wash cold, inside out, with mild detergent. Do not soak, wring or bleach." },
  { k: "Drying", v: "Dry flat in the shade." },
  { k: "Ironing", v: "Iron on the reverse, on a low setting." },
];
const CARE_PAINTING = [
  { k: "Light", v: "Hang away from direct sunlight." },
  { k: "Moisture", v: "Keep away from damp walls and bathrooms." },
  { k: "Cleaning", v: "Dust gently with a dry, soft brush. Do not use water." },
];
const CARE_JEWELLERY = [
  { k: "Water", v: "Keep dry. Remove before bathing or swimming." },
  { k: "Cleaning", v: "Wipe gently with a soft dry cloth." },
  { k: "Storage", v: "Store flat in the pouch, away from perfume." },
];

/**
 * The product page's "Details" and "Care" tabs, from Design/Product.dc.html.
 * Rows that were only placeholders there (sizes, dimensions, dispatch times)
 * are left out until the owner supplies real values.
 */
export function detailTabs(p: Product): DetailTab[] {
  const painting = `${p.style} (filled colour), painted by hand in fabric colours`;
  const ground = `${p.colour} ground`;
  const rows = (list: ({ k: string; v: string | null | undefined } | false)[]) =>
    list.filter((r): r is { k: string; v: string } => !!r && !!r.v);

  if (p.section === "paintings") {
    return [
      { title: "Details", rows: rows([{ k: "Medium", v: `Natural and acrylic colours on ${p.fabric?.toLowerCase()}` }, { k: "Style", v: `${p.style} (filled colour)` }, { k: "Framing", v: p.frame }, { k: "Signed", v: "By the artist, on the reverse" }, { k: "Each piece", v: "An original. No two are the same." }]) },
      { title: "Care", rows: CARE_PAINTING },
    ];
  }
  if (p.sub === "Jewellery") {
    return [
      { title: "Details", rows: rows([{ k: "Material", v: p.fabric }, { k: "Painting", v: `${p.style} (filled colour), painted by hand` }, { k: "Drops", v: "Pearl beads and gold-tone balls" }, { k: "Fastening", v: "Push-back post" }, { k: "Each piece", v: "Hand-painted, so the two earrings differ slightly from each other and from the photos." }]) },
      { title: "Care", rows: CARE_JEWELLERY },
    ];
  }
  if (p.sub === "Bags") {
    return [
      { title: "Details", rows: rows([{ k: "Material", v: p.fabric }, { k: "Painting", v: painting }, { k: "Each piece", v: VARIES }]) },
      { title: "Care", rows: CARE_TEXTILE },
    ];
  }
  if (p.section === "homedecor") {
    return [
      { title: "Details", rows: rows([{ k: "Fabric", v: p.fabric }, { k: "Painting", v: painting }, { k: "Colour", v: ground }, { k: "Includes", v: p.includes }, p.sub === "Wall hangings" && { k: "Mounting", v: "Wooden rod and hanging cord included" }, { k: "Each piece", v: VARIES }]) },
      { title: "Care", rows: CARE_TEXTILE },
    ];
  }
  if (p.sub === "Kurtas & Kurtis") {
    return [
      { title: "Details", rows: rows([{ k: "Fabric", v: p.fabric }, { k: "Painting", v: painting }, { k: "Colour", v: ground }, { k: "Includes", v: p.includes ?? "Kurta" }, { k: "Sleeves", v: "Three-quarter" }, { k: "Each piece", v: VARIES }]) },
      { title: "Care", rows: CARE_TEXTILE },
    ];
  }
  if (["Dupattas", "Stoles", "Scarves", "Handkerchiefs"].includes(p.sub)) {
    return [
      { title: "Details", rows: rows([{ k: "Fabric", v: p.fabric }, { k: "Painting", v: painting }, { k: "Colour", v: ground }, { k: "Edge", v: p.edge ?? "Tassels in red, green and ivory" }, { k: "Fit", v: "Free size" }, { k: "Each piece", v: VARIES }]) },
      { title: "Care", rows: CARE_TEXTILE },
    ];
  }
  return [
    { title: "Details", rows: rows([{ k: "Fabric", v: p.fabric }, { k: "Painting", v: painting }, { k: "Colour", v: ground }, { k: "Blouse piece", v: "Included, unstitched" }, { k: "Fit", v: "Free size" }, { k: "Each piece", v: VARIES }]) },
    { title: "Care", rows: CARE_TEXTILE },
  ];
}
