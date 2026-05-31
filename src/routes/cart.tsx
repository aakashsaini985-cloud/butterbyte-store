import { createFileRoute, Link } from "@tanstack/react-router";
import { Trash2, ShoppingBag } from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { cart, useStore } from "@/lib/store";
import { inr, PLACEHOLDER_IMG } from "@/lib/format";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [{ title: "Shopping Bag — BUTTERBYTE STORE" }] }),
  component: CartPage,
});

function CartPage() {
  const { cartItems } = useStore();
  const subtotal = cartItems.reduce((s, l) => s + l.price * l.qty, 0);
  const shipping = subtotal >= 999 || subtotal === 0 ? 0 : 79;
  const total = subtotal + shipping;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 mx-auto max-w-6xl px-6 py-10 w-full">
        <h1 className="font-display text-4xl md:text-5xl mb-8">Shopping Bag</h1>
        {cartItems.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">Your bag is empty.</p>
            <Link to="/shop" className="mt-6 inline-block px-6 py-3 bg-foreground text-background text-sm uppercase tracking-[0.2em]">Continue shopping</Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-[1fr_360px] gap-10">
            <div className="space-y-4">
              {cartItems.map((l) => (
                <div key={`${l.productId}|${l.size ?? ""}`} className="flex gap-4 border-b pb-4">
                  <Link to="/p/$slug" params={{ slug: l.slug }} className="w-24 aspect-[3/4] bg-muted shrink-0">
                    <img src={l.image || PLACEHOLDER_IMG} alt={l.name} className="w-full h-full object-cover" />
                  </Link>
                  <div className="flex-1">
                    <Link to="/p/$slug" params={{ slug: l.slug }} className="text-sm font-medium hover:underline">{l.name}</Link>
                    {l.size && <div className="text-xs text-muted-foreground mt-1">Size: {l.size}</div>}
                    <div className="mt-2 text-sm font-semibold">{inr(l.price)}</div>
                    <div className="mt-3 flex items-center gap-3">
                      <div className="inline-flex border">
                        <button onClick={() => cart.setQty(l.productId, l.size, l.qty - 1)} className="px-3 py-1">−</button>
                        <span className="px-3 py-1 border-x">{l.qty}</span>
                        <button onClick={() => cart.setQty(l.productId, l.size, l.qty + 1)} className="px-3 py-1">+</button>
                      </div>
                      <button onClick={() => cart.remove(l.productId, l.size)} className="text-muted-foreground hover:text-foreground"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <aside className="border p-6 h-fit space-y-3 text-sm">
              <div className="text-xs uppercase tracking-[0.2em] mb-2">Order Summary</div>
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{inr(subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{shipping === 0 ? "Free" : inr(shipping)}</span></div>
              <div className="flex justify-between border-t pt-3 text-base font-semibold"><span>Total</span><span>{inr(total)}</span></div>
              <Link to="/checkout" className="block text-center bg-foreground text-background py-3 text-sm uppercase tracking-[0.2em] mt-4 hover:bg-[oklch(0.78_0.13_85)] hover:text-black transition">Checkout</Link>
              <Link to="/shop" className="block text-center text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground mt-2">Continue shopping</Link>
            </aside>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
