import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Our Story — BUTTERBYTE STORE" },
      { name: "description", content: "BUTTERBYTE STORE — a Delhi-born fashion house where tradition meets contemporary elegance. Crafted with passion. Designed for elegance." },
      { property: "og:title", content: "Our Story — BUTTERBYTE STORE" },
      { property: "og:description", content: "Where tradition meets contemporary elegance. Discover the BUTTERBYTE STORE story." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-6 pt-14 md:pt-24 pb-10">
          <div className="text-[10px] tracking-[0.3em] uppercase text-[oklch(0.78_0.13_85)]">Our Story</div>
          <h1 className="font-display text-4xl md:text-6xl mt-3 leading-tight">
            Where tradition meets <span className="italic text-[oklch(0.65_0.15_85)]">contemporary elegance</span>.
          </h1>
        </section>

        <section className="mx-auto max-w-6xl px-6 grid md:grid-cols-2 gap-10 md:gap-14 items-center pb-16 md:pb-24">
          <div className="aspect-[4/5] overflow-hidden bg-muted">
            <img
              src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1400&q=80"
              alt="BUTTERBYTE STORE craftsmanship"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="space-y-6 text-foreground/80 leading-relaxed text-[15px] md:text-base">
            <p>
              <strong className="text-foreground">BUTTERBYTE STORE</strong> is a Delhi-born fashion house where tradition meets contemporary elegance. We are passionate about every detail — from the richness of premium fabrics and the precision of every stitch to the way each silhouette drapes effortlessly. Inspired by India&rsquo;s timeless craftsmanship and modern fashion sensibilities, our collections are designed to make every moment feel special.
            </p>
            <p>
              At Butterbyte Store, we believe fashion is more than clothing; it is a reflection of confidence, individuality, and style. Every piece is thoughtfully created to deliver exceptional quality, comfort, and sophistication, ensuring you look and feel your best wherever you go.
            </p>
            <p className="font-display text-2xl md:text-3xl text-foreground pt-2">
              Crafted with passion. Designed for elegance. Made to be remembered.
            </p>
            <div className="pt-4">
              <Link to="/shop" className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.2em] gold-underline">
                Shop the collection <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        <section className="bg-[oklch(0.97_0.01_85)] py-16 md:py-24">
          <div className="mx-auto max-w-5xl px-6 grid sm:grid-cols-3 gap-8 text-center">
            {[
              { k: "Crafted", v: "Premium fabrics, handpicked for every piece." },
              { k: "Designed", v: "Silhouettes that feel both modern and timeless." },
              { k: "Delivered", v: "Across India with care, quality assured." },
            ].map((b) => (
              <div key={b.k}>
                <div className="font-display text-2xl md:text-3xl">{b.k}</div>
                <p className="mt-3 text-sm text-foreground/70 leading-relaxed">{b.v}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
