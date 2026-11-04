"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { ProductCard } from "@/components/product-card";
import { useWishlist } from "@/components/wishlist";
import type { Product } from "@/lib/store";

const hydrated = () => true;
const notHydrated = () => false;
const noop = () => () => {};

export function WishlistView({ products }: { products: Product[] }) {
  const { ids } = useWishlist();
  // The saved list only exists in the browser; render nothing until it's read.
  const ready = useSyncExternalStore(noop, hydrated, notHydrated);
  if (!ready) return null;

  const byId = new Map(products.map((p) => [p.id, p]));
  // Hidden or removed pieces simply drop out of the list.
  const saved = ids.map((id) => byId.get(id)).filter((p): p is Product => !!p);

  if (saved.length === 0) {
    return (
      <div className="empty-state">
        <span className="display" style={{ fontSize: 26, color: "var(--brand)" }}>Your wishlist is empty</span>
        <span style={{ fontSize: 15.5, color: "var(--muted)", maxWidth: "40ch" }}>Tap the heart on any piece to save it here for later.</span>
        <Link href="/clothing" className="btn btn-primary" style={{ marginTop: 6 }}>Browse clothing</Link>
      </div>
    );
  }

  return (
    <>
      <p className="lede">
        {saved.length === 1 ? "1 saved piece" : `${saved.length} saved pieces`}. Your wishlist is saved on this device. Most pieces are one of a
        kind, so a saved piece can still sell to someone else.
      </p>
      <div className="product-grid">
        {saved.map((p) => <ProductCard key={p.id} p={p} />)}
      </div>
    </>
  );
}
