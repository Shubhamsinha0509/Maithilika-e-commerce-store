"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { createLocalStore } from "@/lib/local-store";

/**
 * Saved pieces, kept in this browser like the bag (no account needed). Only
 * product ids are stored; names, prices and sold status always come fresh
 * from the shop.
 */
const store = createLocalStore<string>("maithilika:wishlist");

export function useWishlist() {
  const ids = useSyncExternalStore(store.subscribe, store.read, store.serverSnapshot);
  return {
    ids,
    has: (id: string) => ids.includes(id),
    toggle: (id: string) => store.write((current) => (current.includes(id) ? current.filter((x) => x !== id) : [id, ...current])),
  };
}

const HEART = "M12 20.5s-7.6-4.6-9.4-9.1C1.3 8 3.4 4.8 6.6 4.8c2 0 3.6 1.1 5.4 3.1 1.8-2 3.4-3.1 5.4-3.1 3.2 0 5.3 3.2 4 6.6-1.8 4.5-9.4 9.1-9.4 9.1z";

export function HeartIcon({ filled, colour, size = 20 }: { filled: boolean; colour: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path d={HEART} fill={filled ? colour : "none"} stroke={colour} strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  );
}

/** The heart on a product card (corner of the photo) or next to "Add to bag". */
export function WishlistButton({ id, variant }: { id: string; variant: "card" | "detail" }) {
  const { has, toggle } = useWishlist();
  const saved = has(id);
  return (
    <button
      type="button"
      className={variant === "card" ? "heart-card" : "heart-detail"}
      onClick={() => toggle(id)}
      aria-pressed={saved}
      aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
      title={saved ? "Remove from wishlist" : "Save to wishlist"}
    >
      <span>
        <HeartIcon filled={saved} colour="#6E1423" size={variant === "card" ? 18 : 22} />
      </span>
    </button>
  );
}

/** Header link with the number of saved pieces. */
export function WishlistLink() {
  const { ids } = useWishlist();
  return (
    <Link href="/wishlist" className="icon-btn" aria-label={ids.length ? `Wishlist, ${ids.length} saved` : "Wishlist"} style={{ position: "relative" }}>
      <HeartIcon filled={false} colour="currentColor" />
      {ids.length > 0 && <span className="bag-count">{ids.length}</span>}
    </Link>
  );
}
