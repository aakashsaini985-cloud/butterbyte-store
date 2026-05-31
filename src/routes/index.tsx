import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { ArrowRight, Truck, ShieldCheck, RefreshCw, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ProductCard } from "@/components/product-card";
import { getHomeData } from "@/lib/catalog.functions";
import { WOMEN_CATEGORIES, MEN_CATEGORIES, SITE } from "@/lib/site";
import heroMen from "@/assets/hero-men.jpg";
import heroWomen from "@/assets/hero-women.jpg";
import heroCollection from "@/assets/hero-collection.jpg";
import shopWomenEthnic from "@/assets/shop-women-ethnic.jpg";
import shopMenEthnic from "@/assets/shop-men-ethnic.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BUTTERBYTE STORE — Modern Indian Fashion" },
      { name: "description", content: "Discover modern Indian fashion — dresses, kurta sets, lehengas, denim and more at BUTTERBYTE STORE." },
      { property: "og:title", content: "BUTTERBYTE STORE — Modern Indian Fashion" },
      { property: "og:description", content: "Discover modern Indian fashion — dresses, kurta sets, lehengas, denim and more." },
    ],
  }),
  component: Home,
});

const CAT_IMG: Record<string, string> = {
  dress: "https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=900&q=80",
  "kurta-set": "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=900&q=80",
  kurti: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=900&q=80",
  "lehenga-choli-sets": "https://images.unsplash.com/photo-1610030469668-8e4a7b5a3a98?w=900&q=80",
  saree: "https://images.unsplash.com/photo-1610189000732-2c4f1e0f0aef?w=900&q=80",
  tops: "https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=900&q=80",
  jeans: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=900&q=80",
  "pyjamas-shorts": "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=900&q=80",
  shirt: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=900&q=80",
  kurtas: "https://images.unsplash.com/photo-1622445275576-721325763afe?w=900&q=80",
  "mens-jeans": "https://images.unsplash.com/photo-1542272604-787c3835535d?w=900&q=80",
  "ethnic-jackets": "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=900&q=80",
  sherwani: "https://images.unsplash.com/photo-1622445275463-afa2ab738c34?w=900&q=80",
  suit: "https://images.unsplash.com/photo-1593030103066-0093718efeb9?w=900&q=80",
  "mens-shorts": "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=900&q=80",
  "joggers-track-pants": "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=900&q=80",
  boxers: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=900&q=80",
};

function Home() {
  const { data } = useQuery({ queryKey: ["home"], queryFn: () => getHomeData() });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Hero banners={data?.banners ?? []} />
        <TrustBar />
        <ShopByGender />
        <CategoryGrid title="Shop Women by Category" gender="women" cats={WOMEN_CATEGORIES} />
        <Section title="New Arrivals" subtitle="Fresh drops, hand-picked for the season" link="/shop" linkLabel="See all new">
          <ProductRow items={data?.newArrivals ?? []} />
        </Section>
        <BannerStrip />
        <Section title="Bestsellers" subtitle="Loved by thousands across India" link="/shop" linkLabel="Shop bestsellers">
          <ProductRow items={data?.bestSellers ?? []} />
        </Section>
        <CategoryGrid title="Shop Men by Category" gender="men" cats={MEN_CATEGORIES} />
        <Section title="Trending Now" subtitle="What the country is wearing this week" link="/shop" linkLabel="View all">
          <ProductRow items={data?.trending ?? []} />
        </Section>
        <Reviews />
        <BrandStory />
        <Newsletter />
      </main>
      <Footer />
    </div>
  );
}

type Slide = {
  eyebrow: string;
  title: string;
  subtitle: string;
  image: string;
  align: "left" | "right" | "center";
  primary: { label: string; href: string };
  secondary: { label: string; href: string };
};

const HERO_SLIDES: Slide[] = [
  {
    eyebrow: "Autumn / Winter ’26",
    title: "The Heirloom Edit",
    subtitle: "Hand-embroidered silhouettes for the modern woman.",
    image: heroWomen,
    align: "right",
    primary: { label: "Shop Women", href: "/women" },
    secondary: { label: "Explore Collection", href: "/shop" },
  },
  {
    eyebrow: "Sharp Tailoring",
    title: "Defined By Detail",
    subtitle: "Sherwanis, suits and shirts crafted in India.",
    image: heroMen,
    align: "left",
    primary: { label: "Shop Men", href: "/men" },
    secondary: { label: "Explore Collection", href: "/shop" },
  },
  {
    eyebrow: "The New Campaign",
    title: "Together, Refined.",
    subtitle: "A collection designed to be worn side by side.",
    image: heroCollection,
    align: "center",
    primary: { label: "Shop Women", href: "/women" },
    secondary: { label: "Shop Men", href: "/men" },
  },
];

function Hero({ banners: _banners }: { banners: any[] }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const n = HERO_SLIDES.length;

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setI((p) => (p + 1) % n), 6000);
    return () => clearInterval(t);
  }, [paused, n]);

  const s = HERO_SLIDES[i];
  const go = (d: number) => setI((p) => (p + d + n) % n);
  const alignCls =
    s.align === "right"
      ? "items-end text-right"
      : s.align === "center"
      ? "items-center text-center"
      : "items-start text-left";

  return (
    <section
      className="relative h-[88vh] min-h-[560px] w-full overflow-hidden bg-black"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
    >
      <AnimatePresence mode="sync">
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ opacity: { duration: 1.1, ease: "easeInOut" }, scale: { duration: 7, ease: "easeOut" } }}
          className="absolute inset-0"
        >
          <img src={s.image} alt={s.title} className="absolute inset-0 w-full h-full object-cover" width={1920} height={1080} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-black/20" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40" />
        </motion.div>
      </AnimatePresence>

      <div className={`relative h-full mx-auto max-w-7xl px-6 flex flex-col justify-end pb-20 md:pb-28 text-white`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={`flex flex-col ${alignCls} max-w-2xl ${s.align === "right" ? "ml-auto" : s.align === "center" ? "mx-auto" : ""}`}
          >
            <div className="text-[11px] tracking-[0.35em] uppercase mb-4 text-[oklch(0.85_0.12_85)]">{s.eyebrow}</div>
            <h1 className="font-display text-5xl md:text-7xl lg:text-[5.5rem] leading-[0.95] tracking-tight">{s.title}</h1>
            <p className="mt-5 text-base md:text-lg text-white/85 max-w-xl">{s.subtitle}</p>
            <div className={`mt-9 flex flex-wrap gap-3 ${s.align === "center" ? "justify-center" : s.align === "right" ? "justify-end" : ""}`}>
              <Link to={s.primary.href} className="group inline-flex items-center gap-2 bg-white text-black px-7 py-3.5 text-xs uppercase tracking-[0.25em] hover:bg-[oklch(0.85_0.12_85)] transition">
                {s.primary.label} <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to={s.secondary.href} className="inline-flex items-center gap-2 border border-white/50 text-white px-7 py-3.5 text-xs uppercase tracking-[0.25em] hover:bg-white hover:text-black transition backdrop-blur-sm">
                {s.secondary.label}
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Arrows */}
      <button
        onClick={() => go(-1)}
        aria-label="Previous slide"
        className="hidden md:flex absolute left-6 top-1/2 -translate-y-1/2 h-12 w-12 items-center justify-center border border-white/30 text-white hover:bg-white hover:text-black transition backdrop-blur-sm"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={() => go(1)}
        aria-label="Next slide"
        className="hidden md:flex absolute right-6 top-1/2 -translate-y-1/2 h-12 w-12 items-center justify-center border border-white/30 text-white hover:bg-white hover:text-black transition backdrop-blur-sm"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Dots + progress */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3">
        {HERO_SLIDES.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setI(idx)}
            aria-label={`Slide ${idx + 1}`}
            className="relative h-[2px] w-10 bg-white/30 overflow-hidden"
          >
            {idx === i && (
              <motion.span
                key={`${i}-${paused}`}
                initial={{ width: "0%" }}
                animate={{ width: paused ? "0%" : "100%" }}
                transition={{ duration: paused ? 0 : 6, ease: "linear" }}
                className="absolute inset-y-0 left-0 bg-[oklch(0.85_0.12_85)]"
              />
            )}
            {idx !== i && <span className="absolute inset-0 bg-transparent" />}
          </button>
        ))}
      </div>
    </section>
  );
}

function TrustBar() {
  const items = [
    { Icon: Truck, t: "Free Shipping", s: "On prepaid orders above ₹999" },
    { Icon: RefreshCw, t: "Easy Returns", s: "7-day hassle-free returns" },
    { Icon: ShieldCheck, t: "Secure Payments", s: "100% safe transactions" },
    { Icon: Sparkles, t: "Premium Quality", s: "Crafted in India" },
  ];
  return (
    <section className="border-b">
      <div className="mx-auto max-w-7xl px-6 grid grid-cols-2 md:grid-cols-4 gap-6 py-8">
        {items.map(({ Icon, t, s }) => (
          <div key={t} className="flex items-center gap-3">
            <Icon className="h-6 w-6 text-[oklch(0.78_0.13_85)] shrink-0" />
            <div>
              <div className="text-sm font-medium">{t}</div>
              <div className="text-xs text-muted-foreground">{s}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ShopByGender() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-16 grid md:grid-cols-2 gap-6">
      {[
        { to: "/women", title: "Women", img: shopWomenEthnic },
        { to: "/men", title: "Men", img: shopMenEthnic },
      ].map((c) => (
        <Link key={c.to} to={c.to} className="group relative overflow-hidden aspect-[4/5] md:aspect-[5/6] block">
          <img src={c.img} alt={c.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
            <div className="text-[10px] tracking-[0.3em] uppercase text-[oklch(0.85_0.12_85)]">Shop</div>
            <div className="font-display text-5xl md:text-6xl">{c.title}</div>
            <div className="mt-2 text-sm flex items-center gap-2 uppercase tracking-[0.2em]">Explore <ArrowRight className="h-4 w-4" /></div>
          </div>
        </Link>
      ))}
    </section>
  );
}

function CategoryGrid({ title, gender, cats }: { title: string; gender: "men" | "women"; cats: { slug: string; name: string }[] }) {
  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <div className="mb-8 flex items-end justify-between">
        <h2 className="font-display text-3xl md:text-4xl">{title}</h2>
        <Link to={`/${gender}`} className="text-xs uppercase tracking-[0.2em] gold-underline">View all</Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {cats.map((c) => (
          <Link key={c.slug} to="/c/$gender/$slug" params={{ gender, slug: c.slug }} className="group">
            <div className="aspect-square overflow-hidden bg-muted">
              <img src={CAT_IMG[c.slug] || "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&q=80"} alt={c.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
            </div>
            <div className="text-sm mt-3 text-center">{c.name}</div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function Section({ title, subtitle, link, linkLabel, children }: { title: string; subtitle?: string; link?: string; linkLabel?: string; children: React.ReactNode }) {
  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl md:text-4xl">{title}</h2>
          {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
        </div>
        {link && <Link to={link} className="text-xs uppercase tracking-[0.2em] gold-underline whitespace-nowrap">{linkLabel}</Link>}
      </div>
      {children}
    </section>
  );
}

function ProductRow({ items }: { items: any[] }) {
  if (!items.length) return <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="aspect-[3/4] bg-muted animate-pulse" />)}</div>;
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10">
      {items.slice(0, 8).map((p) => <ProductCard key={p.id} p={p} />)}
    </div>
  );
}

function BannerStrip() {
  return (
    <section className="mx-auto max-w-7xl px-6">
      <Link to="/shop" search={{ filter: "sale" } as any} className="block relative overflow-hidden h-[280px] md:h-[360px] group">
        <img src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1920&q=80" alt="Mid-season sale" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative h-full flex flex-col items-center justify-center text-white text-center px-6">
          <div className="text-[10px] tracking-[0.3em] uppercase text-[oklch(0.85_0.12_85)]">Limited time</div>
          <div className="font-display text-4xl md:text-6xl mt-2">Mid-Season Sale · Up to 40% Off</div>
          <div className="mt-4 text-sm uppercase tracking-[0.2em] inline-flex items-center gap-2">Shop now <ArrowRight className="h-4 w-4" /></div>
        </div>
      </Link>
    </section>
  );
}

function Reviews() {
  const r = [
    { name: "Aanya S.", city: "Mumbai", text: "Beautiful fabric, true to size, and the packaging felt like a luxury gift. Hooked." },
    { name: "Riya M.", city: "Bengaluru", text: "Loved the kurta set — wore it for Diwali and got endless compliments." },
    { name: "Priya K.", city: "Delhi", text: "Premium quality at a fair price. Returns were quick when I sized up." },
  ];
  return (
    <section className="bg-[oklch(0.97_0.01_85)] py-20 mt-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center mb-12">
          <div className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground">Loved by</div>
          <h2 className="font-display text-3xl md:text-4xl mt-2">10,000+ happy customers</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {r.map((x) => (
            <div key={x.name} className="bg-white p-8 border border-border">
              <div className="text-[oklch(0.78_0.13_85)] mb-3">★★★★★</div>
              <p className="text-sm leading-relaxed text-foreground/80">“{x.text}”</p>
              <div className="mt-4 text-xs uppercase tracking-[0.2em] text-muted-foreground">{x.name} · {x.city}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function BrandStory() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20 grid md:grid-cols-2 gap-12 items-center">
      <div className="aspect-[4/5] overflow-hidden bg-muted">
        <img src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1200&q=80" alt="Brand" className="w-full h-full object-cover" />
      </div>
      <div>
        <div className="text-[10px] tracking-[0.3em] uppercase text-[oklch(0.78_0.13_85)]">Our story</div>
        <h2 className="font-display text-4xl md:text-5xl mt-3">Made in India. Made for you.</h2>
        <p className="mt-6 text-foreground/70 leading-relaxed">
          {SITE.brand} is a Delhi-born fashion house obsessed with details — the weight of fabric, the fall of a hem, the way light catches embroidery at dusk. Every piece is designed to feel both modern and timeless.
        </p>
        <Link to="/about" className="mt-8 inline-flex items-center gap-2 text-sm uppercase tracking-[0.2em] gold-underline">
          Read our story <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}

function Newsletter() {
  return (
    <section className="bg-black text-white py-20">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <div className="text-[10px] tracking-[0.3em] uppercase text-[oklch(0.85_0.12_85)]">Join the club</div>
        <h2 className="font-display text-4xl md:text-5xl mt-3">Early access. Better prices.</h2>
        <p className="mt-3 text-white/70">Subscribe for first dibs on new drops, private sales and styling notes.</p>
        <form onSubmit={(e) => { e.preventDefault(); alert("Thanks — you're on the list!"); }} className="mt-8 flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <input required type="email" placeholder="you@email.com" className="flex-1 px-4 py-3 bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:border-[oklch(0.85_0.12_85)]" />
          <button className="px-6 py-3 bg-[oklch(0.85_0.12_85)] text-black uppercase tracking-[0.2em] text-xs hover:bg-white transition">Subscribe</button>
        </form>
      </div>
    </section>
  );
}
