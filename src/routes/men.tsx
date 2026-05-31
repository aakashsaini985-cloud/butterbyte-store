import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ProductCard } from "@/components/product-card";
import { listProducts } from "@/lib/catalog.functions";
import { MEN_CATEGORIES } from "@/lib/site";

export const Route = createFileRoute("/men")({
  head: () => ({ meta: [{ title: "Men — BUTTERBYTE STORE" }, { name: "description", content: "Shop men's shirts, kurtas, jeans, sherwanis and more." }] }),
  component: Men,
});

function Men() {
  const { data, isLoading } = useQuery({ queryKey: ["men"], queryFn: () => listProducts({ data: { gender: "men", limit: 60 } }) });
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 mx-auto max-w-7xl px-6 py-10 w-full">
        <h1 className="font-display text-5xl md:text-6xl mb-2">Men</h1>
        <p className="text-muted-foreground mb-8">Sharp tailoring and easy essentials.</p>
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="aspect-[3/4] bg-muted animate-pulse" />)}</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10">
            {data?.products.map((p) => <ProductCard key={p.id} p={p} />)}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
