import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ProductCard } from "@/components/product-card";
import { listProducts } from "@/lib/catalog.functions";
import { WOMEN_CATEGORIES, MEN_CATEGORIES } from "@/lib/site";

type Sort = "featured" | "price_asc" | "price_desc" | "rating";

type CatSearch = {
  sort?: Sort;
  max?: number;
  sizes?: string[];
  colors?: string[];
};

function parseList(v: unknown): string[] {
  if (Array.isArray(v)) return v.filter((x) => typeof x === "string");
  if (typeof v === "string" && v.length) return v.split(",").filter(Boolean);
  return [];
}

export const Route = createFileRoute("/c/$gender/$slug")({
  validateSearch: (s: Record<string, unknown>): CatSearch => ({
    sort: (["featured", "price_asc", "price_desc", "rating"].includes(s.sort as string)
      ? (s.sort as Sort)
      : undefined),
    max: typeof s.max === "number" ? s.max : s.max ? Number(s.max) || undefined : undefined,
    sizes: parseList(s.sizes),
    colors: parseList(s.colors),
  }),
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug.replace(/-/g, " ")} — BUTTERBYTE STORE` },
      { name: "description", content: `Shop ${params.slug.replace(/-/g, " ")} for ${params.gender} at BUTTERBYTE STORE.` },
    ],
  }),
  component: CategoryPage,
});

const COLOR_SWATCHES: Array<[string, string]> = [
  ["Black", "#000"], ["White", "#fff"], ["Beige", "#d6c9b3"],
  ["Navy", "#0a1d3a"], ["Red", "#a01c1c"], ["Olive", "#5a6b3a"],
  ["Pink", "#e8a8b8"], ["Gold", "#c9a84c"], ["Blue", "#2b6cb0"],
  ["Green", "#2f7a4d"], ["Grey", "#8a8a8a"], ["Brown", "#6b4a2b"],
];

const SIZE_ORDER = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "XXXL"];

function CategoryPage() {
  const { gender, slug } = Route.useParams();
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/c/$gender/$slug" });

  const { data, isLoading } = useQuery({
    queryKey: ["cat", gender, slug],
    queryFn: () => listProducts({ data: { categorySlug: slug, limit: 120 } }),
  });

  const cats = gender === "men" ? MEN_CATEGORIES : WOMEN_CATEGORIES;
  const current = cats.find((c) => c.slug === slug);

  const sort: Sort = search.sort ?? "featured";
  const selectedSizes: string[] = search.sizes ?? [];
  const selectedColors: string[] = search.colors ?? [];

  const [mobileOpen, setMobileOpen] = useState(false);

  const products = data?.products ?? [];

  // Derive the actual sizes available in this category from the data.
  const availableSizes = useMemo(() => {
    const set = new Set<string>();
    for (const p of products) for (const s of p.sizes ?? []) set.add(s.toUpperCase());
    return Array.from(set).sort(
      (a, b) => {
        const ia = SIZE_ORDER.indexOf(a);
        const ib = SIZE_ORDER.indexOf(b);
        if (ia === -1 && ib === -1) return a.localeCompare(b);
        if (ia === -1) return 1;
        if (ib === -1) return -1;
        return ia - ib;
      },
    );
  }, [products]);

  const priceCeiling = useMemo(() => {
    const m = Math.max(0, ...products.map((p) => p.selling_price));
    return Math.max(500, Math.ceil(m / 500) * 500);
  }, [products]);

  const maxPrice = search.max ?? priceCeiling;

  const setSearch = (patch: Partial<CatSearch>) => {
    navigate({
      params: { gender, slug },
      search: (prev: CatSearch) => {
        const next: CatSearch = { ...prev, ...patch };
        // Strip empty/default values so URLs stay clean.
        if (!next.sizes || next.sizes.length === 0) delete next.sizes;
        if (!next.colors || next.colors.length === 0) delete next.colors;
        if (next.sort === "featured" || !next.sort) delete next.sort;
        if (next.max == null || next.max >= priceCeiling) delete next.max;
        return next;
      },
      replace: true,
    });
  };

  const toggleSize = (s: string) =>
    setSearch({
      sizes: selectedSizes.includes(s)
        ? selectedSizes.filter((x) => x !== s)
        : [...selectedSizes, s],
    });
  const toggleColor = (c: string) =>
    setSearch({
      colors: selectedColors.includes(c)
        ? selectedColors.filter((x) => x !== c)
        : [...selectedColors, c],
    });

  const filtered = useMemo(() => {
    let arr = products.filter((p) => p.selling_price <= maxPrice);
    if (selectedSizes.length) {
      arr = arr.filter((p) =>
        (p.sizes ?? []).some((s) => selectedSizes.includes(s.toUpperCase())),
      );
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

  // Debug logging — visible in browser console for verification.
  useEffect(() => {
    if (typeof window === "undefined") return;
    // eslint-disable-next-line no-console
    console.debug("[filters]", {
      gender, slug,
      total: products.length,
      visible: filtered.length,
      availableSizes,
      selectedSizes,
      selectedColors,
      sort,
      maxPrice,
      priceCeiling,
    });
  }, [gender, slug, products.length, filtered.length, availableSizes, selectedSizes, selectedColors, sort, maxPrice, priceCeiling]);

  const cap = priceCeiling || 10000;
  const effectiveMax = Math.min(maxPrice, cap);

  const hasActiveFilters =
    selectedSizes.length > 0 ||
    selectedColors.length > 0 ||
    (search.max != null && search.max < priceCeiling) ||
    (search.sort && search.sort !== "featured");

  const clearAll = () =>
    navigate({ params: { gender, slug }, search: {}, replace: true });

  const Filters = (
    <div className="space-y-8">
      {hasActiveFilters && (
        <button
          type="button"
          onClick={clearAll}
          className="w-full border border-foreground text-xs uppercase tracking-[0.2em] py-2 hover:bg-foreground hover:text-background transition"
        >
          Clear all filters
        </button>
      )}

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
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs uppercase tracking-[0.2em] font-medium">Price</div>
          {search.max != null && search.max < priceCeiling && (
            <button type="button" onClick={() => setSearch({ max: undefined })} className="text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground">Reset</button>
          )}
        </div>
        <input
          type="range"
          min={0}
          max={cap}
          step={100}
          value={effectiveMax}
          onChange={(e) => setSearch({ max: Number(e.target.value) })}
          className="w-full accent-[oklch(0.78_0.13_85)]"
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-2">
          <span>₹0</span><span>Up to ₹{effectiveMax.toLocaleString("en-IN")}</span>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs uppercase tracking-[0.2em] font-medium">
            Size {availableSizes.length > 0 && <span className="text-muted-foreground normal-case tracking-normal">({availableSizes.length})</span>}
          </div>
          {selectedSizes.length > 0 && (
            <button type="button" onClick={() => setSearch({ sizes: [] })} className="text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground">Clear</button>
          )}
        </div>
        {availableSizes.length === 0 ? (
          <p className="text-xs text-muted-foreground">No sizes available for this category.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {availableSizes.map((s) => {
              const active = selectedSizes.includes(s);
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleSize(s)}
                  className={`h-9 min-w-9 px-2 border text-xs transition ${active ? "bg-foreground text-background border-foreground" : "hover:border-foreground"}`}
                >
                  {s}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs uppercase tracking-[0.2em] font-medium">Color</div>
          {selectedColors.length > 0 && (
            <button type="button" onClick={() => setSearch({ colors: [] })} className="text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground">Clear</button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {COLOR_SWATCHES.map(([n, c]) => {
            const active = selectedColors.includes(n);
            return (
              <button
                key={n}
                type="button"
                aria-label={n}
                aria-pressed={active}
                title={n}
                onClick={() => toggleColor(n)}
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
        <p className="text-sm text-muted-foreground mb-6">{filtered.length} of {products.length} products</p>

        <div className="flex items-center justify-between gap-3 mb-6 border-y py-3">
          <button onClick={() => setMobileOpen(true)} className="md:hidden inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em]">
            <SlidersHorizontal className="h-4 w-4" /> Filters
            {hasActiveFilters && <span className="ml-1 h-1.5 w-1.5 rounded-full bg-[oklch(0.78_0.13_85)]" />}
          </button>
          <div className="hidden md:block text-xs uppercase tracking-[0.2em] text-muted-foreground">Refine</div>
          <select
            value={sort}
            onChange={(e) => setSearch({ sort: e.target.value as Sort })}
            className="border px-3 py-2 text-xs bg-background uppercase tracking-[0.15em]"
          >
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
              <div className="py-20 text-center text-muted-foreground space-y-4">
                <p>No products match your filters.</p>
                {hasActiveFilters && (
                  <button onClick={clearAll} className="text-xs uppercase tracking-[0.2em] underline">
                    Clear all filters
                  </button>
                )}
              </div>
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
