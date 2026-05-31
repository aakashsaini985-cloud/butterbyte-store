import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ProductCard } from "@/components/product-card";
import { listProducts } from "@/lib/catalog.functions";

const search = z.object({
  filter: z.enum(["new", "bestsellers", "sale", "trending"]).optional(),
  q: z.string().optional(),
  sort: z.enum(["new", "price_asc", "price_desc", "bestseller"]).optional(),
  min: z.coerce.number().optional(),
  max: z.coerce.number().optional(),
});

export const Route = createFileRoute("/shop")({
  validateSearch: search,
  head: () => ({ meta: [{ title: "Shop All — BUTTERBYTE STORE" }, { name: "description", content: "Browse the full BUTTERBYTE STORE catalog." }] }),
  component: Shop,
});

function Shop() {
  const s = Route.useSearch();
  const flag = s.filter === "bestsellers" ? "bestseller" : s.filter;
  const { data, isLoading } = useQuery({
    queryKey: ["shop", s],
    queryFn: () => listProducts({ data: { flag: flag as any, q: s.q, sort: s.sort, minPrice: s.min, maxPrice: s.max, limit: 60 } }),
  });
  const navigate = Route.useNavigate();
  const titleMap: Record<string, string> = { new: "New Arrivals", bestsellers: "Bestsellers", sale: "On Sale", trending: "Trending" };
  const title = s.q ? `Search: "${s.q}"` : titleMap[s.filter ?? ""] ?? "Shop All";

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 mx-auto max-w-7xl px-6 py-10 w-full">
        <div className="mb-8">
          <h1 className="font-display text-4xl md:text-5xl">{title}</h1>
          <p className="text-sm text-muted-foreground mt-2">{data?.total ?? 0} products</p>
        </div>
        <div className="flex flex-wrap gap-3 mb-8 items-center">
          <select
            value={s.sort ?? "new"}
            onChange={(e) => navigate({ search: (prev) => ({ ...prev, sort: e.target.value as any }) })}
            className="border px-3 py-2 text-sm bg-background"
          >
            <option value="new">Newest</option>
            <option value="bestseller">Bestseller</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
          {(["new", "bestsellers", "sale", "trending"] as const).map((f) => (
            <button
              key={f}
              onClick={() => navigate({ search: (prev) => ({ ...prev, filter: prev.filter === f ? undefined : f }) })}
              className={`px-3 py-2 text-xs uppercase tracking-[0.18em] border transition ${s.filter === f ? "bg-black text-white border-black" : "border-border hover:border-foreground"}`}
            >
              {f}
            </button>
          ))}
        </div>
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="aspect-[3/4] bg-muted animate-pulse" />)}</div>
        ) : data?.products.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground">No products found.</div>
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
