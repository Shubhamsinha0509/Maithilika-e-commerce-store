import { sectionByKey, type Product } from "@/lib/store";

/** Every word must appear somewhere in the piece's searchable text. */
export function matchProducts(products: Product[], query: string) {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  return products.filter((p) => {
    const text = [p.name, p.motif, p.motifHi, p.fabric, p.colour, p.style, p.medium, p.sub, sectionByKey(p.section)?.label]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return words.every((w) => text.includes(w));
  });
}

/** Tappable suggestions shown before the customer types. Each one finds pieces. */
export const POPULAR_SEARCHES = ["Peacock", "Lotus", "Fish", "Silk saree", "Canvas", "Earrings"];
