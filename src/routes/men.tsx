import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { MEN_CATEGORIES } from "@/lib/site";
import catBoxers from "@/assets/cat-boxers.jpg";
import catEthnicJackets from "@/assets/cat-ethnic-jackets.jpg";
import catMensJeans from "@/assets/cat-mens-jeans.jpg";
import catJoggers from "@/assets/cat-joggers.jpg";
import catKurtas from "@/assets/cat-kurtas.jpg";
import catSherwani from "@/assets/cat-sherwani.jpg";
import catShirt from "@/assets/cat-shirt.jpg";
import catMensShorts from "@/assets/cat-mens-shorts.jpg";
import catSuit from "@/assets/cat-suit.jpg";

const CAT_IMG: Record<string, string> = {
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

export const Route = createFileRoute("/men")({
  head: () => ({ meta: [{ title: "Shop Men by Category — BUTTERBYTE STORE" }, { name: "description", content: "Browse men's categories — shirts, kurtas, jeans, sherwanis, suits and more." }] }),
  component: Men,
});

function Men() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 mx-auto max-w-7xl px-6 py-10 w-full">
        <h1 className="font-display text-5xl md:text-6xl mb-2">Men</h1>
        <p className="text-muted-foreground mb-10">Shop by category — sharp tailoring and easy essentials.</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10">
          {MEN_CATEGORIES.map((c) => (
            <Link key={c.slug} to="/c/$gender/$slug" params={{ gender: "men", slug: c.slug }} className="group">
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
