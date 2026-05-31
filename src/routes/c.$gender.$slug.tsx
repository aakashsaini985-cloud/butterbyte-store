import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
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

function CategoryPage() {
  const { gender, slug } = Route.useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["cat", gender, slug],
    queryFn: () => listProducts({ data: { categorySlug: slug, limit: 60 } }),
  });
  const cats = gender === "men" ? MEN_CATEGORIES : WOMEN_CATEGORIES;
  const current = cats.find((c) => c.slug === slug);
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 mx-auto max-w-7xl px-6 py-10 w-full">
        <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">
          <Link to={`/${gender}`} className="hover:text-foreground">{gender}</Link> · {current?.name ?? slug}
        </div>
        <h1 className="font-display text-4xl md:text-5xl mb-2">{current?.name ?? slug.replace(/-/g, " ")}</h1>
        <p className="text-sm text-muted-foreground mb-8">{data?.total ?? 0} products</p>
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="aspect-[3/4] bg-muted animate-pulse" />)}</div>
        ) : data?.products.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground">No products yet in this category.</div>
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
