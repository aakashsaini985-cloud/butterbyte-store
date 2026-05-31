import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ProductCard } from "@/components/product-card";
import { listProducts } from "@/lib/catalog.functions";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/wishlist")({
  head: () => ({ meta: [{ title: "Wishlist — BUTTERBYTE STORE" }] }),
  component: WishlistPage,
});

function WishlistPage() {
  const { wishIds } = useStore();
  // Simple approach: fetch a large pool and filter; for real scale, add a getProductsByIds fn.
  const { data } = useQuery({ queryKey: ["wishlist-pool"], queryFn: () => listProducts({ data: { limit: 200 } }) });
  const items = (data?.products ?? []).filter((p) => wishIds.includes(p.id));
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 mx-auto max-w-7xl px-6 py-10 w-full">
        <h1 className="font-display text-4xl md:text-5xl mb-8">Wishlist</h1>
        {wishIds.length === 0 ? (
          <div className="text-center py-20">
            <Heart className="h-12 w-12 mx-auto text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">Your wishlist is empty.</p>
            <Link to="/shop" className="mt-6 inline-block px-6 py-3 bg-foreground text-background text-sm uppercase tracking-[0.2em]">Start shopping</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10">
            {items.map((p) => <ProductCard key={p.id} p={p} />)}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
