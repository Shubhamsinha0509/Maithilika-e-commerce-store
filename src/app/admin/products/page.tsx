import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { updateProduct } from "@/app/admin/actions";
import { AdminNav } from "@/components/admin-nav";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { productHref, sectionByKey, tileCrop, type ImageLayout } from "@/lib/store";

export const metadata: Metadata = { title: "Products · Admin" };

export default function AdminProductsPage({ searchParams }: PageProps<"/admin/products">) {
  return (
    <section className="wrap admin-page">
      <Suspense fallback={<p>Loading…</p>}>
        <Products query={searchParams} />
      </Suspense>
    </section>
  );
}

async function Products({ query }: { query: PageProps<"/admin/products">["searchParams"] }) {
  await requireAdmin();
  const params = await query;
  // Every product, including hidden ones, which the shop leaves out.
  const products = await prisma.product.findMany({ orderBy: [{ section: "asc" }, { position: "asc" }] });

  return (
    <>
      <AdminNav current="products" />
      <p className="field-help" style={{ maxWidth: "70ch" }}>
        Change a price, mark a one-of-a-kind piece sold or available, or hide a piece from the shop, then press Save on that row.
        Paid orders mark pieces sold automatically. Made-to-order pieces never sell out.
      </p>
      {typeof params.error === "string" && <p role="alert" className="checkout-message">{params.error}</p>}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr><th>Piece</th><th>Section</th><th>Price (₹)</th><th>Sold</th><th>Hidden</th><th /></tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const crop = tileCrop({ layout: p.imageLayout as ImageLayout });
              const formId = `p-${p.id}`;
              return (
                <tr key={p.id} id={p.id} className={params.saved === p.id ? "is-saved" : undefined}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span className="cart-thumb" style={{ width: 48 }}>
                        {/* eslint-disable-next-line @next/next/no-img-element -- collage crop needs width > 100% */}
                        <img src={p.image} alt="" style={{ width: crop.width, objectPosition: crop.position }} />
                      </span>
                      <span>
                        <Link href={productHref(p.id)} target="_blank" style={{ fontWeight: 600, color: "var(--ink)" }}>{p.name}</Link>
                        <br />
                        <span className="field-help">{p.sub}{p.madeToOrder ? " · made to order" : ""}</span>
                      </span>
                    </div>
                  </td>
                  <td>{sectionByKey(p.section)?.label}</td>
                  <td>
                    <input form={formId} name="price" type="number" min={1} step={1} defaultValue={p.price} className="admin-price" aria-label={`Price of ${p.name}`} />
                  </td>
                  <td>
                    {p.madeToOrder ? (
                      <span className="field-help">n/a</span>
                    ) : (
                      <input form={formId} name="sold" type="checkbox" defaultChecked={p.sold} className="admin-check" aria-label={`${p.name} is sold`} />
                    )}
                  </td>
                  <td>
                    <input form={formId} name="hidden" type="checkbox" defaultChecked={p.hidden} className="admin-check" aria-label={`Hide ${p.name}`} />
                  </td>
                  <td>
                    <form id={formId} action={updateProduct}>
                      <input type="hidden" name="id" value={p.id} />
                      <button type="submit" className="btn btn-outline" style={{ minHeight: 38, padding: "0 14px", fontSize: 14 }}>
                        {params.saved === p.id ? "Saved ✓" : "Save"}
                      </button>
                    </form>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
