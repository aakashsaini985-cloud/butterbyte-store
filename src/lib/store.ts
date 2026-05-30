// Lightweight client-side cart & wishlist store backed by localStorage.
// (DB sync for logged-in users is a later iteration.)
import { useEffect, useState } from "react";

const CART_KEY = "bb:cart";
const WISH_KEY = "bb:wish";

export type CartLine = {
  productId: string;
  slug: string;
  name: string;
  price: number;
  mrp: number;
  image: string | null;
  size?: string;
  qty: number;
};

type Listener = () => void;
const listeners = new Set<Listener>();
const emit = () => listeners.forEach((l) => l());

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try { return JSON.parse(localStorage.getItem(key) || "") as T; } catch { return fallback; }
}
function write(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
  emit();
}

export const cart = {
  get(): CartLine[] { return read<CartLine[]>(CART_KEY, []); },
  add(line: Omit<CartLine, "qty"> & { qty?: number }) {
    const items = cart.get();
    const key = (l: CartLine) => `${l.productId}|${l.size ?? ""}`;
    const incoming: CartLine = { qty: 1, ...line };
    const ix = items.findIndex((l) => key(l) === key(incoming));
    if (ix >= 0) items[ix].qty += incoming.qty;
    else items.push(incoming);
    write(CART_KEY, items);
  },
  setQty(productId: string, size: string | undefined, qty: number) {
    const items = cart.get().map((l) => (l.productId === productId && (l.size ?? "") === (size ?? "") ? { ...l, qty } : l)).filter((l) => l.qty > 0);
    write(CART_KEY, items);
  },
  remove(productId: string, size?: string) {
    write(CART_KEY, cart.get().filter((l) => !(l.productId === productId && (l.size ?? "") === (size ?? ""))));
  },
  clear() { write(CART_KEY, []); },
  count() { return cart.get().reduce((s, l) => s + l.qty, 0); },
  subtotal() { return cart.get().reduce((s, l) => s + l.price * l.qty, 0); },
};

export const wishlist = {
  get(): string[] { return read<string[]>(WISH_KEY, []); },
  has(id: string) { return wishlist.get().includes(id); },
  toggle(id: string) {
    const ids = wishlist.get();
    write(WISH_KEY, ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]);
  },
  count() { return wishlist.get().length; },
};

export function useStore() {
  const [, setTick] = useState(0);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
    const l = () => setTick((t) => t + 1);
    listeners.add(l);
    const onStorage = (e: StorageEvent) => { if (e.key === CART_KEY || e.key === WISH_KEY) l(); };
    window.addEventListener("storage", onStorage);
    return () => { listeners.delete(l); window.removeEventListener("storage", onStorage); };
  }, []);
  return {
    cartCount: hydrated ? cart.count() : 0,
    wishCount: hydrated ? wishlist.count() : 0,
    cartItems: hydrated ? cart.get() : [],
    wishIds: hydrated ? wishlist.get() : [],
  };
}
