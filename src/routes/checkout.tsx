import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { cart, useStore } from "@/lib/store";
import { inr } from "@/lib/format";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Checkout — BUTTERBYTE STORE" }] }),
  component: Checkout,
});

function Checkout() {
  const { cartItems } = useStore();
  const navigate = useNavigate();
  const subtotal = cartItems.reduce((s, l) => s + l.price * l.qty, 0);
  const shipping = subtotal >= 999 || subtotal === 0 ? 0 : 79;
  const total = subtotal + shipping;
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const orderNo = "BB" + Date.now().toString().slice(-8);
    setTimeout(() => {
      cart.clear();
      navigate({ to: "/order-success", search: { o: orderNo } as any });
    }, 600);
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground">Your bag is empty.</p>
            <Link to="/shop" className="mt-4 inline-block underline">Go shopping</Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 mx-auto max-w-6xl px-6 py-10 w-full">
        <h1 className="font-display text-4xl md:text-5xl mb-8">Checkout</h1>
        <form onSubmit={onSubmit} className="grid lg:grid-cols-[1fr_360px] gap-10">
          <div className="space-y-6">
            <Section title="Contact">
              <Input label="Email" type="email" name="email" required />
              <Input label="Phone" type="tel" name="phone" required />
            </Section>
            <Section title="Shipping Address">
              <Input label="Full Name" name="name" required />
              <Input label="Address line 1" name="line1" required />
              <Input label="Address line 2 (optional)" name="line2" />
              <div className="grid grid-cols-2 gap-3">
                <Input label="City" name="city" required />
                <Input label="State" name="state" required />
              </div>
              <Input label="PIN code" name="pincode" required />
            </Section>
            <Section title="Payment">
              <label className="flex items-start gap-3 border p-4 cursor-pointer">
                <input type="radio" defaultChecked name="pm" className="mt-1" />
                <div>
                  <div className="text-sm font-medium">Cash on Delivery</div>
                  <div className="text-xs text-muted-foreground">Pay when your order arrives. Online payments coming soon.</div>
                </div>
              </label>
            </Section>
          </div>
          <aside className="border p-6 h-fit space-y-3 text-sm">
            <div className="text-xs uppercase tracking-[0.2em] mb-2">Order Summary</div>
            {cartItems.map((l) => (
              <div key={`${l.productId}|${l.size ?? ""}`} className="flex justify-between text-xs text-muted-foreground">
                <span className="truncate pr-2">{l.name} × {l.qty}</span>
                <span>{inr(l.price * l.qty)}</span>
              </div>
            ))}
            <div className="border-t pt-3 flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{inr(subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{shipping === 0 ? "Free" : inr(shipping)}</span></div>
            <div className="flex justify-between border-t pt-3 text-base font-semibold"><span>Total</span><span>{inr(total)}</span></div>
            <button disabled={submitting} type="submit" className="block w-full text-center bg-foreground text-background py-3 text-sm uppercase tracking-[0.2em] mt-4 hover:bg-[oklch(0.78_0.13_85)] hover:text-black transition disabled:opacity-60">{submitting ? "Placing order…" : "Place Order"}</button>
          </aside>
        </form>
      </main>
      <Footer />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border p-6 space-y-3">
      <div className="text-xs uppercase tracking-[0.2em] mb-1">{title}</div>
      {children}
    </div>
  );
}
function Input({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="text-xs text-muted-foreground">{label}</span>
      <input {...props} className="mt-1 w-full border px-3 py-2 bg-background focus:outline-none focus:border-foreground" />
    </label>
  );
}
