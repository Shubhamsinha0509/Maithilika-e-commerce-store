#!/usr/bin/env node
/**
 * Loads the 44-product catalogue from Design/sarees.js into the Product table.
 *
 *   npm run db:seed              insert products that are not in the database yet
 *   npm run db:seed -- --dry-run print what would be inserted, touch nothing
 *
 * Existing rows are left alone, so re-running never overwrites a price or
 * "sold" flag the admin has changed.
 */
import "dotenv/config";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import pg from "pg";

const dryRun = process.argv.includes("--dry-run");

// sarees.js is a browser script that assigns window.MAITHILIKA_SAREES.
const sandbox = { window: { dispatchEvent() {} }, Event: class {} };
vm.runInNewContext(readFileSync("Design/sarees.js", "utf8"), sandbox);
const source = sandbox.window.MAITHILIKA_SAREES;

// Sarees in sarees.js rely on these defaults from Product.dc.html and ProductCard.dc.html.
const SAREE_LAYOUT = {
  iw: 1145, ih: 1374, ar: 1145 / 1374, cardW: "160.8%", cardPos: "0 3%",
  views: [["Full look", 0, 0, 1145, 1374], ["Pallu painting", 300, 380, 410, 492], ["Motif close-up", 738, 462, 380, 456], ["Border detail", 738, 928, 372, 446], ["Pleats and fall", 738, 0, 376, 452]],
};

const products = source.map((s, i) => {
  const isSaree = s.sub === "Sarees";
  const layout = isSaree ? SAREE_LAYOUT : { iw: s.iw, ih: s.ih, ar: s.ar, cardW: s.cardW, cardPos: s.cardPos, views: s.views };
  return {
    id: s.id,
    name: s.name,
    section: s.section,
    sub: s.sub,
    price: s.price,
    motif: s.motif,
    motifHi: s.motifHi ?? null,
    motifText: s.motifText ?? null,
    fabric: s.fabric ?? null,
    colour: s.colour ?? null,
    style: s.style ?? null,
    medium: s.medium ?? null,
    frame: s.frame ?? null,
    edge: s.edge ?? null,
    includes: s.includes ?? null,
    optionLabel: s.optTitle ?? (isSaree ? "Blouse" : null),
    options: s.opts ?? (isSaree ? ["Unstitched blouse piece", "Stitched to measure"] : []),
    image: "/" + s.img.replace(/\.png$/, ".jpg"),
    imageLayout: layout,
    madeToOrder: !s.ready,
    position: i,
  };
});

if (dryRun) {
  for (const p of products) console.log(`${p.id.padEnd(14)} ${p.section.padEnd(12)} ₹${p.price}  ${p.madeToOrder ? "made to order" : "one-of-a-kind"}  ${p.image}`);
  console.log(`\n${products.length} products (dry run, nothing written)`);
  process.exit(0);
}

const client = new pg.Client({ connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL });
await client.connect();
let inserted = 0;
try {
  for (const p of products) {
    const cols = Object.keys(p);
    const values = cols.map((c) => (c === "imageLayout" ? JSON.stringify(p[c]) : p[c]));
    const res = await client.query(
      `INSERT INTO "Product" (${cols.map((c) => `"${c}"`).join(", ")}, "updatedAt")
       VALUES (${cols.map((_, i) => `$${i + 1}`).join(", ")}, now())
       ON CONFLICT ("id") DO NOTHING`,
      values,
    );
    inserted += res.rowCount;
  }
} finally {
  await client.end();
}
console.log(`Inserted ${inserted} new products (${products.length - inserted} already present).`);
