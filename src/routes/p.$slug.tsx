import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Heart, ShoppingBag, Truck, RefreshCw, ShieldCheck, Check } from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { getProductBySlug } from "@/lib/catalog.functions";
import { inr, PLACEHOLDER_IMG } from "@/lib/format";
import { cart, wishlist, useStore } from "@/lib/store";

export const Route = createFileRoute("/p/$slug")({
  head: ({ params }) => ({ meta: [{ title: `${params.slug.replace(/-/g, " ")} — BUTTERBYTE STORE` }] }),
  component: ProductPage,
});

const DEFAULT_SIZES = ["XS", "S", "M", "L", "XL"];

function ProductPage() {
  const { slug } = Route.useParams();
  const navigate = useNavigate();
  const { wishIds } = useStore();
  const { data: p, isLoading } = useQuery({ queryKey: ["product", slug], queryFn: () => getProductBySlug({ data: { slug } }) });
  const [activeImg, setActiveImg] = useState(0);
  const [size, setSize] = useState<string | undefined>();
  const [added, setAdded] = useState(false);

  if (isLoading) return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 mx-auto max-w-7xl px-6 py-10 w-full grid md:grid-cols-2 gap-10">
        <div className="aspect-[3/4] bg-muted animate-pulse" />
        <div className="space-y-3">
          <div className="h-8 bg-muted animate-pulse w-3/4" />
          <div className="h-4 bg-muted animate-pulse w-1/3" />
        </div>
      </div>
    </div>
  );

  if (!p) return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center"><div>Product not found. <Link to="/shop" className="underline">Back to shop</Link></div></div>
      <Footer />
    </div>
  );

  const images = (p.product_images?.length ? p.product_images : [{ url: PLACEHOLDER_IMG }]) as { url: string }[];
  const wished = wishIds.includes(p.id);
  const onAdd = () => {
    cart.add({ productId: p.id, slug: p.slug, name: p.name, price: Number(p.selling_price), mrp: Number(p.mrp), image: images[0].url, size });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };
  const onBuy = () => { onAdd(); navigate({ to: "/cart" }); };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 mx-auto max-w-7xl px-6 py-10 w-full">
        <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">
          <Link to="/shop" className="hover:text-foreground">Shop</Link>
          {p.categories?.slug && <> · <Link to="/c/$gender/$slug" params={{ gender: p.categories.gender, slug: p.categories.slug }} className="hover:text-foreground">{p.categories.name}</Link></>}
        </div>
        <div className="grid md:grid-cols-2 gap-10">
          <div>
            <div className="aspect-[3/4] bg-muted overflow-hidden">
              <img src={images[activeImg].url} alt={p.name} className="w-full h-full object-cover" />
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto">
                {images.map((im, i) => (
                  <button key={i} onClick={() => setActiveImg(i)} className={`aspect-[3/4] w-20 shrink-0 overflow-hidden border-2 ${activeImg === i ? "border-foreground" : "border-transparent"}`}>
                    <img src={im.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{p.brand}</div>
            <h1 className="font-display text-3xl md:text-4xl mt-1">{p.name}</h1>
            <div className="mt-2 text-sm text-muted-foreground flex items-center gap-2">
              <span className="text-[oklch(0.78_0.13_85)]">★ {Number(p.rating_avg).toFixed(1)}</span>
              <span>· {p.rating_count} reviews</span>
            </div>
            <div className="mt-6 flex items-baseline gap-3">
              <span className="text-2xl font-semibold">{inr(p.selling_price)}</span>
              {Number(p.mrp) > Number(p.selling_price) && <>
                <span className="text-base text-muted-foreground line-through">{inr(p.mrp)}</span>
                <span className="text-sm text-[oklch(0.55_0.18_140)]">({p.discount_pct}% off)</span>
              </>}
            </div>
            <div className="text-xs text-[oklch(0.55_0.18_140)] mt-1">Inclusive of all taxes</div>

            <div className="mt-8">
              <div className="text-xs uppercase tracking-[0.2em] mb-3">Select Size</div>
              <div className="flex flex-wrap gap-2">
                {DEFAULT_SIZES.map((sz) => (
                  <button key={sz} onClick={() => setSize(sz)} className={`min-w-12 px-4 py-3 border text-sm transition ${size === sz ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground"}`}>{sz}</button>
                ))}
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <button onClick={onAdd} className="flex-1 inline-flex items-center justify-center gap-2 bg-foreground text-background py-4 text-sm uppercase tracking-[0.2em] hover:bg-[oklch(0.78_0.13_85)] hover:text-black transition">
                {added ? <><Check className="h-4 w-4" /> Added</> : <><ShoppingBag className="h-4 w-4" /> Add to Bag</>}
              </button>
              <button onClick={onBuy} className="flex-1 border border-foreground py-4 text-sm uppercase tracking-[0.2em] hover:bg-foreground hover:text-background transition">Buy Now</button>
              <button onClick={() => wishlist.toggle(p.id)} aria-label="Wishlist" className="p-4 border border-border hover:border-foreground transition">
                <Heart className={`h-5 w-5 ${wished ? "fill-[oklch(0.78_0.13_85)] text-[oklch(0.78_0.13_85)]" : ""}`} />
              </button>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-3 text-xs">
              <div className="flex items-center gap-2"><Truck className="h-4 w-4 text-[oklch(0.78_0.13_85)]" /> Free shipping ₹999+</div>
              <div className="flex items-center gap-2"><RefreshCw className="h-4 w-4 text-[oklch(0.78_0.13_85)]" /> 7-day returns</div>
              <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-[oklch(0.78_0.13_85)]" /> Secure payment</div>
            </div>

            {p.description && (
              <div className="mt-10 border-t pt-6">
                <div className="text-xs uppercase tracking-[0.2em] mb-3">Description</div>
                <p className="text-sm text-foreground/80 leading-relaxed">{p.description}</p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
