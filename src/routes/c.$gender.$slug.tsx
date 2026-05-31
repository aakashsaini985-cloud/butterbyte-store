import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ProductCard } from "@/components/product-card";
import { listProducts } from "@/lib/catalog.functions";
import { WOMEN_CATEGORIES, MEN_CATEGORIES } from "@/lib/site";

export const Route = createFileRoute("/c/$gender/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug.replace(/-/g, " ")} — BUTTERBYTE STORE` },
      { name: "description", content: `Shop ${params.slug.replace(/-/g, " ")} for ${params.gender} at BUTTERBYTE STORE.` },
    ],
  }),
  component: CategoryPage,
});

type Sort = "featured" | "price_asc" | "price_desc" | "rating";

function CategoryPage() {
  const { gender, slug } = Route.useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["cat", gender, slug],
    queryFn: () => listProducts({ data: { categorySlug: slug, limit: 120 } }),
  });
  const cats = gender === "men" ? MEN_CATEGORIES : WOMEN_CATEGORIES;
  const current = cats.find((c) => c.slug === slug);

  const [sort, setSort] = useState<Sort>("featured");
  const [maxPrice, setMaxPrice] = useState<number>(10000);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);

  const toggle = (list: string[], v: string) =>
    list.includes(v) ? list.filter((x) => x !== v) : [...list, v];

  const products = data?.products ?? [];
  const priceCeiling = useMemo(() => {
    const m = Math.max(0, ...products.map((p) => p.selling_price));
    return Math.max(500, Math.ceil(m / 500) * 500);
  }, [products]);

  const filtered = useMemo(() => {
    let arr = products.filter((p) => p.selling_price <= maxPrice);
    if (selectedSizes.length) {
      arr = arr.filter((p) => p.sizes?.some((s) => selectedSizes.includes(s)));
    }
    if (selectedColors.length) {
      arr = arr.filter((p) => {
        const hay = p.name.toLowerCase();
        return selectedColors.some((c) => hay.includes(c.toLowerCase()));
      });
    }
    switch (sort) {
      case "price_asc": arr = [...arr].sort((a, b) => a.selling_price - b.selling_price); break;
      case "price_desc": arr = [...arr].sort((a, b) => b.selling_price - a.selling_price); break;
      case "rating": arr = [...arr].sort((a, b) => b.rating_avg - a.rating_avg); break;
    }
    return arr;
  }, [products, sort, maxPrice, selectedSizes, selectedColors]);

  const cap = priceCeiling || 10000;
  const effectiveMax = Math.min(maxPrice, cap);

  const Filters = (
    <div className="space-y-8">
      <div>
        <div className="text-xs uppercase tracking-[0.2em] mb-3 font-medium">Sub-Category</div>
        <div className="flex flex-col gap-1.5">
          {cats.map((c) => (
            <Link
              key={c.slug}
              to="/c/$gender/$slug"
              params={{ gender, slug: c.slug }}
              className={`text-sm py-1 hover:text-[oklch(0.65_0.15_85)] ${c.slug === slug ? "font-semibold underline underline-offset-4 decoration-[oklch(0.78_0.13_85)]" : "text-muted-foreground"}`}
            >
              {c.name}
            </Link>
          ))}
        </div>
      </div>
      <div>
        <div className="text-xs uppercase tracking-[0.2em] mb-3 font-medium">Price</div>
        <input
          type="range"
          min={0}
          max={cap}
          step={100}
          value={effectiveMax}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full accent-[oklch(0.78_0.13_85)]"
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-2">
          <span>₹0</span><span>Up to ₹{effectiveMax.toLocaleString("en-IN")}</span>
        </div>
      </div>
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs uppercase tracking-[0.2em] font-medium">Size</div>
          {selectedSizes.length > 0 && (
            <button type="button" onClick={() => setSelectedSizes([])} className="text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground">Clear</button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {["XS", "S", "M", "L", "XL", "XXL"].map((s) => {
            const active = selectedSizes.includes(s);
            return (
              <button
                key={s}
                type="button"
                onClick={() => setSelectedSizes((prev) => toggle(prev, s))}
                className={`h-9 min-w-9 px-2 border text-xs transition ${active ? "bg-foreground text-background border-foreground" : "hover:border-foreground"}`}
              >
                {s}
              </button>
            );
          })}
        </div>
      </div>
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs uppercase tracking-[0.2em] font-medium">Color</div>
          {selectedColors.length > 0 && (
            <button type="button" onClick={() => setSelectedColors([])} className="text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground">Clear</button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            ["Black", "#000"], ["White", "#fff"], ["Beige", "#d6c9b3"],
            ["Navy", "#0a1d3a"], ["Red", "#a01c1c"], ["Olive", "#5a6b3a"],
            ["Pink", "#e8a8b8"], ["Gold", "#c9a84c"],
          ].map(([n, c]) => {
            const active = selectedColors.includes(n);
            return (
              <button
                key={n}
                type="button"
                aria-label={n}
                aria-pressed={active}
                title={n}
                onClick={() => setSelectedColors((prev) => toggle(prev, n))}
                className={`h-7 w-7 rounded-full border transition ${active ? "ring-2 ring-offset-2 ring-foreground border-foreground" : "border-border ring-1 ring-inset ring-black/5"}`}
                style={{ background: c }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 mx-auto max-w-7xl px-4 md:px-6 py-8 w-full">
        <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">
          <Link to={`/${gender}`} className="hover:text-foreground">{gender}</Link> · {current?.name ?? slug}
        </div>
        <h1 className="font-display text-2xl md:text-5xl mb-1">{current?.name ?? slug.replace(/-/g, " ")}</h1>
        <p className="text-sm text-muted-foreground mb-6">{filtered.length} products</p>

        <div className="flex items-center justify-between gap-3 mb-6 border-y py-3">
          <button onClick={() => setMobileOpen(true)} className="md:hidden inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em]">
            <SlidersHorizontal className="h-4 w-4" /> Filters
          </button>
          <div className="hidden md:block text-xs uppercase tracking-[0.2em] text-muted-foreground">Refine</div>
          <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="border px-3 py-2 text-xs bg-background uppercase tracking-[0.15em]">
            <option value="featured">Featured</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>

        <div className="grid md:grid-cols-[240px_1fr] gap-8">
          <aside className="hidden md:block">{Filters}</aside>
          <div>
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">{Array.from({ length: 9 }).map((_, i) => <div key={i} className="aspect-[3/4] bg-muted animate-pulse" />)}</div>
            ) : filtered.length === 0 ? (
              <div className="py-20 text-center text-muted-foreground">No products match your filters.</div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-x-3 sm:gap-x-4 gap-y-8 md:gap-y-10">
                {filtered.map((p) => <ProductCard key={p.id} p={p} />)}
              </div>
            )}
          </div>
        </div>
      </main>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-[300px] bg-background p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="text-sm uppercase tracking-[0.2em] font-medium">Filters</div>
              <button onClick={() => setMobileOpen(false)} aria-label="Close"><X className="h-5 w-5" /></button>
            </div>
            {Filters}
            <button onClick={() => setMobileOpen(false)} className="mt-8 w-full bg-foreground text-background py-3 text-xs uppercase tracking-[0.2em]">Apply</button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
