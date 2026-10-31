"use client";

import { createContext, useCallback, useContext, useMemo, useState, useSyncExternalStore } from "react";
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
};

// ── localStorage as an external store ──────────────────────────────────────

const STORAGE_KEY = "maithilika:cart";
const EMPTY: CartLine[] = [];
const listeners = new Set<() => void>();
let cachedRaw: string | null = null;
let cachedLines: CartLine[] = EMPTY;

function readLines(): CartLine[] {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch {
    // Storage blocked: behave as an empty cart.
  }
  // Same string, same array: useSyncExternalStore needs a stable snapshot.
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    try {
      const parsed = JSON.parse(raw ?? "[]");
      cachedLines = Array.isArray(parsed) ? parsed : EMPTY;
    } catch {
      cachedLines = EMPTY;
    }
  }
  return cachedLines;
}

function writeLines(update: (current: CartLine[]) => CartLine[]) {
  const next = update(readLines());
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Private mode or storage full: nothing to persist to.
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  // Keeps the cart in sync across open tabs.
  const onStorage = (e: StorageEvent) => e.key === STORAGE_KEY && listener();
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

// ── Provider ───────────────────────────────────────────────────────────────

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  // The server (and first client render) see an empty cart; then the stored one.
  const lines = useSyncExternalStore(subscribe, readLines, () => EMPTY);
  const [isOpen, setIsOpen] = useState(false);

  const add = useCallback((p: Product, option: string | null) => {
    const key = p.id + "|" + (option ?? "");
    writeLines((current) => {
      const existing = current.find((l) => l.key === key);
      if (existing) {
        if (!existing.madeToOrder) return current;
        return current.map((l) => (l.key === key ? { ...l, qty: l.qty + 1 } : l));
      }
      return [...current, { key, id: p.id, name: p.name, option, price: p.price, image: p.image, crop: tileCrop(p), qty: 1, madeToOrder: p.madeToOrder }];
    });
    setIsOpen(true);
  }, []);

  const setQty = useCallback((key: string, qty: number) => {
    writeLines((current) =>
      current
        .map((l) => (l.key === key ? { ...l, qty: l.madeToOrder ? qty : Math.min(qty, 1) } : l))
        .filter((l) => l.qty > 0),
    );
  }, []);

  const remove = useCallback((key: string) => writeLines((current) => current.filter((l) => l.key !== key)), []);

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
    }),
    [lines, isOpen, add, setQty, remove],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
