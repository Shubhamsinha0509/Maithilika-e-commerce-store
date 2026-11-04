import type { Metadata } from "next";
import { WishlistView } from "@/components/wishlist-view";
import { getProducts } from "@/lib/catalog";

export const metadata: Metadata = { title: "Wishlist" };

export default async function WishlistPage() {
  const products = await getProducts();
  return (
    <section className="wrap" style={{ paddingBlock: "clamp(32px, 5vw, 56px) 72px", display: "flex", flexDirection: "column", gap: 24, minHeight: "50vh" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <span className="eyebrow">Saved for later</span>
        <h1 className="section-title">Your wishlist</h1>
      </div>
      <WishlistView products={products} />
    </section>
  );
}
