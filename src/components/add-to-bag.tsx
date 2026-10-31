"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/components/cart";
import type { Product } from "@/lib/store";

/** The card's quick-add button. Uses the product's first option, as the design does. */
export function AddToBagButton({ product }: { product: Product }) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!added) return;
    const t = setTimeout(() => setAdded(false), 1800);
    return () => clearTimeout(t);
  }, [added]);

  // Sizes must be chosen on the product page, so the card links there instead.
  if (product.optionLabel === "Size" && product.options.length > 1) {
    return (
      <Link href={`/product/${product.id}`} className="card-add">Choose a size</Link>
    );
  }

  return (
    <button
      className={added ? "card-add is-added" : "card-add"}
      onClick={() => {
        add(product, product.options[0] ?? null);
        setAdded(true);
      }}
    >
      {added ? "Added to bag" : "Add to bag"}
    </button>
  );
}
