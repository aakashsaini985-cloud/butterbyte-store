import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { WOMEN_CATEGORIES } from "@/lib/site";
import catDress from "@/assets/cat-dress.jpg";
import catJeans from "@/assets/cat-jeans.jpg";
import catKurtaSet from "@/assets/cat-kurta-set.jpg";
import catKurti from "@/assets/cat-kurti.jpg";
import catLehenga from "@/assets/cat-lehenga.jpg";
import catPyjamas from "@/assets/cat-pyjamas.jpg";
import catSaree from "@/assets/cat-saree.jpg";
import catTops from "@/assets/cat-tops.jpg";

const CAT_IMG: Record<string, string> = {
  dress: catDress,
  jeans: catJeans,
  "kurta-set": catKurtaSet,
  kurti: catKurti,
  "lehenga-choli-sets": catLehenga,
  "pyjamas-shorts": catPyjamas,
  saree: catSaree,
  tops: catTops,
};

export const Route = createFileRoute("/women")({
  head: () => ({ meta: [{ title: "Shop Women by Category — BUTTERBYTE STORE" }, { name: "description", content: "Browse women's categories — dresses, kurta sets, sarees, lehengas and more." }] }),
  component: Women,
});

function Women() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 mx-auto max-w-7xl px-6 py-10 w-full">
        <h1 className="font-display text-5xl md:text-6xl mb-2">Women</h1>
        <p className="text-muted-foreground mb-10">Shop by category — modern Indian wear for every occasion.</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10">
          {WOMEN_CATEGORIES.map((c) => (
            <Link key={c.slug} to="/c/$gender/$slug" params={{ gender: "women", slug: c.slug }} className="group">
              <div className="aspect-[3/4] overflow-hidden bg-muted">
                <img src={CAT_IMG[c.slug]} alt={c.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              </div>
              <div className="mt-3 text-center text-sm uppercase tracking-[0.18em]">{c.name}</div>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
