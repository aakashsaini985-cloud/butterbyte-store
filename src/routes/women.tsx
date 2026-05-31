import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ProductCard } from "@/components/product-card";
import { listProducts } from "@/lib/catalog.functions";
import { WOMEN_CATEGORIES } from "@/lib/site";

export const Route = createFileRoute("/women")({
  head: () => ({ meta: [{ title: "Women — BUTTERBYTE STORE" }, { name: "description", content: "Shop women's dresses, kurta sets, sarees and more." }] }),
  component: Women,
});

function Women() {
  const { data, isLoading } = useQuery({ queryKey: ["women"], queryFn: () => listProducts({ data: { gender: "women", limit: 60 } }) });
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 mx-auto max-w-7xl px-6 py-10 w-full">
        <h1 className="font-display text-5xl md:text-6xl mb-2">Women</h1>
        <p className="text-muted-foreground mb-8">Modern Indian wear for every occasion.</p>
        <div className="flex gap-2 overflow-x-auto pb-3 mb-8 no-scrollbar">
          {WOMEN_CATEGORIES.map((c) => (
            <Link key={c.slug} to="/c/$gender/$slug" params={{ gender: "women", slug: c.slug }} className="shrink-0 px-4 py-2 text-xs uppercase tracking-[0.18em] border hover:bg-black hover:text-white transition">{c.name}</Link>
          ))}
        </div>
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
