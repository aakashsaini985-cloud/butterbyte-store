import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { trackOrder } from "@/lib/orders.functions";
import { inr } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/track-order")({
  head: () => ({ meta: [{ title: "Track Order — BUTTERBYTE STORE" }] }),
  component: TrackOrderPage,
});

function TrackOrderPage() {
  const [orderNo, setOrderNo] = useState("");
  const [contact, setContact] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<any | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setResult(null);
    try {
      const r = await trackOrder({ data: { order_no: orderNo.trim(), contact: contact.trim() } });
      setResult(r);
    } catch (err: any) {
      toast.error(err?.message || "Could not find this order");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 mx-auto max-w-2xl w-full px-4 sm:px-6 py-10">
        <h1 className="font-display text-4xl mb-2">Track your order</h1>
        <p className="text-sm text-muted-foreground mb-6">Enter your order number and the email or phone used at checkout.</p>
        <form onSubmit={onSubmit} className="space-y-4 border p-5 sm:p-6">
          <label className="block">
            <span className="text-xs text-muted-foreground">Order number (e.g. BB12345678)</span>
            <input value={orderNo} onChange={(e) => setOrderNo(e.target.value)} required className="mt-1 w-full border px-3 py-2 bg-background focus:outline-none focus:border-foreground" />
          </label>
          <label className="block">
            <span className="text-xs text-muted-foreground">Email or 10-digit phone</span>
            <input value={contact} onChange={(e) => setContact(e.target.value)} required className="mt-1 w-full border px-3 py-2 bg-background focus:outline-none focus:border-foreground" />
          </label>
          <button disabled={busy} className="w-full bg-foreground text-background py-3 text-sm uppercase tracking-[0.2em] disabled:opacity-60">
            {busy ? "Looking up…" : "Track Order"}
          </button>
        </form>

        {result && (
          <div className="mt-8 border p-5 sm:p-6 space-y-4">
            <div className="flex flex-wrap justify-between items-start gap-3">
              <div>
                <div className="text-xs text-muted-foreground uppercase tracking-[0.2em]">Order</div>
                <div className="font-mono text-lg">{result.order.order_no}</div>
                <div className="text-xs text-muted-foreground mt-1">Placed on {new Date(result.order.created_at).toLocaleDateString()}</div>
              </div>
              <div className="text-xs uppercase tracking-wider px-3 py-1.5 border rounded bg-[oklch(0.78_0.13_85)] text-black">
                {result.order.status}
              </div>
            </div>
            <ul className="divide-y">
              {result.items.map((it: any, i: number) => (
                <li key={i} className="py-3 flex justify-between text-sm">
                  <span className="truncate pr-3">{it.name} × {it.qty}</span>
                  <span>{inr(Number(it.price) * it.qty)}</span>
                </li>
              ))}
            </ul>
            <div className="border-t pt-3 flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{inr(Number(result.order.subtotal))}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Shipping</span>
              <span>{Number(result.order.shipping) === 0 ? "Free" : inr(Number(result.order.shipping))}</span>
            </div>
            <div className="flex justify-between text-base font-semibold border-t pt-3">
              <span>Total</span>
              <span>{inr(Number(result.order.total))}</span>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
