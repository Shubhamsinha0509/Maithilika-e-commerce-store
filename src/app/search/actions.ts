"use server";

import { getProducts } from "@/lib/catalog";
import { matchProducts } from "@/lib/search";
import { inr, sectionByKey, tileCrop } from "@/lib/store";

export type QuickResult = {
  total: number;
  items: { id: string; name: string; meta: string; price: string; sold: boolean; image: string; crop: { width: string; position: string } }[];
};

/** Results as the customer types: the first few matches, and how many there are in all. */
export async function quickSearch(query: string): Promise<QuickResult> {
  const q = String(query ?? "").trim().slice(0, 100);
  if (q.length < 2) return { total: 0, items: [] };
  const matches = matchProducts(await getProducts(), q);
  return {
    total: matches.length,
    items: matches.slice(0, 6).map((p) => ({
      id: p.id,
      name: p.name,
      meta: [sectionByKey(p.section)?.label, p.sub].filter(Boolean).join(" · "),
      price: inr(p.price),
      sold: p.sold && !p.madeToOrder,
      image: p.image,
      crop: tileCrop(p),
    })),
  };
}
