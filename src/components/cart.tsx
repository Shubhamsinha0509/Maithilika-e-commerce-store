"use client";

import { createContext, useCallback, useContext, useMemo, useState, useSyncExternalStore } from "react";
import { createLocalStore } from "@/lib/local-store";
import { tileCrop, type Product } from "@/lib/store";

/**
 * The cart lives in the browser (localStorage) until checkout. Prices here are
 * for display only: checkout recalculates everything from the database.
 */
export type CartLine = {
  key: string;
  id: string;
  name: string;
  option: string | null;
  price: number;
  image: string;
  crop: { width: string; position: string };
  qty: number;
  /** One-of-a-kind pieces stay at quantity 1; made-to-order ones can repeat. */
  madeToOrder: boolean;
};

type CartContextValue = {
  lines: CartLine[];
  count: number;
  subtotal: number;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  add: (p: Product, option: string | null) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  /** Removes every line for these product ids, e.g. pieces that just sold. */
  removeProducts: (ids: string[]) => void;
  /** Replaces saved prices with current ones from checkout. */
  updatePrices: (prices: Record<string, number>) => void;
  clear: () => void;
};

/** Checkout accepts up to 10 of one made-to-order piece (src/lib/checkout.ts). */
export const MAX_QTY = 10;
const store = createLocalStore<CartLine>("maithilika:cart");
const writeLines = store.write;

// ── Provider ───────────────────────────────────────────────────────────────

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  // The server (and first client render) see an empty cart; then the stored one.
  const lines = useSyncExternalStore(store.subscribe, store.read, store.serverSnapshot);
  const [isOpen, setIsOpen] = useState(false);

  const add = useCallback((p: Product, option: string | null) => {
    const key = p.id + "|" + (option ?? "");
    const line: CartLine = { key, id: p.id, name: p.name, option, price: p.price, image: p.image, crop: tileCrop(p), qty: 1, madeToOrder: p.madeToOrder };
    writeLines((current) => {
      if (!p.madeToOrder) {
        // A one-of-a-kind piece is one line; picking another option replaces it.
        return current.some((l) => l.id === p.id) ? current.map((l) => (l.id === p.id ? line : l)) : [...current, line];
      }
      const existing = current.find((l) => l.key === key);
      if (existing) return current.map((l) => (l.key === key ? { ...l, qty: Math.min(l.qty + 1, MAX_QTY) } : l));
      return [...current, line];
    });
    setIsOpen(true);
  }, []);

  const setQty = useCallback((key: string, qty: number) => {
    writeLines((current) =>
      current
        .map((l) => (l.key === key ? { ...l, qty: Math.min(qty, l.madeToOrder ? MAX_QTY : 1) } : l))
        .filter((l) => l.qty > 0),
    );
  }, []);

  const updatePrices = useCallback(
    (prices: Record<string, number>) => writeLines((current) => current.map((l) => (prices[l.id] !== undefined ? { ...l, price: prices[l.id] } : l))),
    [],
  );

  const remove = useCallback((key: string) => writeLines((current) => current.filter((l) => l.key !== key)), []);
  const removeProducts = useCallback((ids: string[]) => writeLines((current) => current.filter((l) => !ids.includes(l.id))), []);
  const clear = useCallback(() => writeLines(() => []), []);

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      count: lines.reduce((n, l) => n + l.qty, 0),
      subtotal: lines.reduce((n, l) => n + l.qty * l.price, 0),
      isOpen,
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
      add,
      setQty,
      remove,
      removeProducts,
      updatePrices,
      clear,
    }),
    [lines, isOpen, add, setQty, remove, removeProducts, updatePrices, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
