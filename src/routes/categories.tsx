import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { MEN_CATEGORIES, WOMEN_CATEGORIES } from "@/lib/site";
import catBoxers from "@/assets/cat-boxers.jpg";
import catEthnicJackets from "@/assets/cat-ethnic-jackets.jpg";
import catMensJeans from "@/assets/cat-mens-jeans.jpg";
import catJoggers from "@/assets/cat-joggers.jpg";
import catKurtas from "@/assets/cat-kurtas.jpg";
import catSherwani from "@/assets/cat-sherwani.jpg";
import catShirt from "@/assets/cat-shirt.jpg";
import catMensShorts from "@/assets/cat-mens-shorts.jpg";
import catSuit from "@/assets/cat-suit.jpg";
import catDress from "@/assets/cat-dress.jpg";
import catJeans from "@/assets/cat-jeans.jpg";
import catKurtaSet from "@/assets/cat-kurta-set.jpg";
import catKurti from "@/assets/cat-kurti.jpg";
import catLehenga from "@/assets/cat-lehenga.jpg";
import catPyjamas from "@/assets/cat-pyjamas.jpg";
import catSaree from "@/assets/cat-saree.jpg";
import catTops from "@/assets/cat-tops.jpg";

const MEN_IMG: Record<string, string> = {
  boxers: catBoxers,
  "ethnic-jackets": catEthnicJackets,
  "mens-jeans": catMensJeans,
  "joggers-track-pants": catJoggers,
  kurtas: catKurtas,
  sherwani: catSherwani,
  shirt: catShirt,
  "mens-shorts": catMensShorts,
  suit: catSuit,
};

const WOMEN_IMG: Record<string, string> = {
  dress: catDress,
  jeans: catJeans,
  "kurta-set": catKurtaSet,
  kurti: catKurti,
  "lehenga-choli-sets": catLehenga,
  "pyjamas-shorts": catPyjamas,
  saree: catSaree,
  tops: catTops,
};

export const Route = createFileRoute("/categories")({
  head: () => ({ meta: [{ title: "Shop by Category — BUTTERBYTE STORE" }, { name: "description", content: "Browse all categories — organized by men's and women's collections." }] }),
  component: Categories,
});

function CategoryGrid({ gender, items, imgMap }: { gender: "men" | "women"; items: { slug: string; name: string }[]; imgMap: Record<string, string> }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10">
      {items.map((c) => (
        <Link key={c.slug} to="/c/$gender/$slug" params={{ gender, slug: c.slug }} className="group">
          <div className="aspect-[3/4] overflow-hidden bg-muted">
            <img src={imgMap[c.slug]} alt={c.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
          </div>
          <div className="mt-3 text-center text-sm uppercase tracking-[0.18em]">{c.name}</div>
        </Link>
      ))}
    </div>
  );
}

function Categories() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 mx-auto max-w-7xl px-6 py-10 w-full">
        <h1 className="font-display text-5xl md:text-6xl mb-2">Shop by Category</h1>
        <p className="text-muted-foreground mb-10">Explore the full collection, organized by category.</p>

        <section className="mb-16">
          <h2 className="font-display text-3xl mb-6">Men</h2>
          <CategoryGrid gender="men" items={MEN_CATEGORIES} imgMap={MEN_IMG} />
        </section>

        <section>
          <h2 className="font-display text-3xl mb-6">Women</h2>
          <CategoryGrid gender="women" items={WOMEN_CATEGORIES} imgMap={WOMEN_IMG} />
        </section>
      </main>
      <Footer />
    </div>
  );
}
