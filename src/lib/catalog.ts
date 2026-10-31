import { cacheLife, cacheTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import type { ImageLayout, Product, SectionKey } from "@/lib/store";

/**
 * Every storefront read goes through getProducts(): one cached query for the
 * whole catalogue (44 rows). Admin edits will call revalidateTag("products").
 * Hidden products are excluded; sold ones stay visible with a "Sold" label.
 */
export async function getProducts(): Promise<Product[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("products");

  const rows = await prisma.product.findMany({
    where: { hidden: false },
    orderBy: { position: "asc" },
  });

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    section: r.section as SectionKey,
    sub: r.sub,
    price: r.price,
    motif: r.motif,
    motifHi: r.motifHi,
    motifText: r.motifText,
    fabric: r.fabric,
    colour: r.colour,
    style: r.style,
    medium: r.medium,
    frame: r.frame,
    edge: r.edge,
    includes: r.includes,
    optionLabel: r.optionLabel,
    options: r.options,
    image: r.image,
    layout: (r.imageLayout ?? { iw: 1, ih: 1, ar: 1 }) as ImageLayout,
    artistName: r.artistName,
    artistVillage: r.artistVillage,
    paintedDays: r.paintedDays,
    madeToOrder: r.madeToOrder,
    leadTimeDays: r.leadTimeDays,
    sold: r.sold,
    position: r.position,
  }));
}

export async function getProduct(id: string) {
  return (await getProducts()).find((p) => p.id === id) ?? null;
}

export async function getSectionProducts(key: SectionKey) {
  return (await getProducts()).filter((p) => p.section === key);
}
