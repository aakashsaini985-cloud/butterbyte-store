import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { Check } from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export const Route = createFileRoute("/order-success")({
  validateSearch: z.object({ o: z.string().optional() }),
  head: () => ({ meta: [{ title: "Order placed — BUTTERBYTE STORE" }] }),
  component: Success,
});

function Success() {
  const { o } = Route.useSearch();
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center px-6 py-20">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-[oklch(0.78_0.13_85)] text-black flex items-center justify-center mx-auto"><Check className="h-8 w-8" /></div>
          <h1 className="font-display text-4xl mt-6">Thank you!</h1>
          <p className="mt-2 text-muted-foreground">Your order has been placed successfully.</p>
          {o && <div className="mt-4 text-sm">Order number: <span className="font-mono">{o}</span></div>}
          <p className="mt-6 text-xs text-muted-foreground">This is a demo checkout — no payment was processed.</p>
          <Link to="/shop" className="mt-8 inline-block px-6 py-3 bg-foreground text-background text-sm uppercase tracking-[0.2em]">Continue shopping</Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
