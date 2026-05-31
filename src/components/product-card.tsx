import { Link, useNavigate } from "@tanstack/react-router";
import { Heart, ShoppingBag, Eye } from "lucide-react";
import { motion } from "framer-motion";
import { inr, PLACEHOLDER_IMG } from "@/lib/format";
import type { ProductCard as P } from "@/lib/catalog.functions";
import { wishlist, cart, useStore } from "@/lib/store";
import { toast } from "sonner";

export function ProductCard({ p, eager = false }: { p: P; eager?: boolean }) {
  const { wishIds } = useStore();
  const wished = wishIds.includes(p.id);
  const navigate = useNavigate();

  const onAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    cart.add({
      productId: p.id,
      slug: p.slug,
      name: p.name,
      price: p.selling_price,
      mrp: p.mrp,
      image: p.image_url,
      qty: 1,
    });
    toast.success("Added to cart", { description: p.name });
  };

  const onView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate({ to: "/p/$slug", params: { slug: p.slug } });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4 }}
      className="group flex flex-col"
    >
      <Link to="/p/$slug" params={{ slug: p.slug }} className="block">
        <div className="relative overflow-hidden bg-muted aspect-[3/4]">
          <img
            src={p.image_url || PLACEHOLDER_IMG}
            alt={p.name}
            loading={eager ? "eager" : "lazy"}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          {p.discount_pct > 0 && (
            <div className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-black text-white text-[9px] sm:text-[10px] tracking-widest uppercase px-1.5 py-0.5 sm:px-2 sm:py-1">
              {p.discount_pct}% off
            </div>
          )}
          <button
            aria-label="Wishlist"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); wishlist.toggle(p.id); }}
            className="absolute top-2 right-2 sm:top-3 sm:right-3 p-1.5 sm:p-2 bg-white/95 hover:bg-white rounded-full shadow-sm transition"
          >
            <Heart className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${wished ? "fill-[oklch(0.78_0.13_85)] text-[oklch(0.78_0.13_85)]" : ""}`} />
          </button>

          {/* Desktop hover quick-add overlay */}
          <div className="hidden md:flex absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-white/95 backdrop-blur-sm">
            <button
              onClick={onAdd}
              className="flex-1 flex items-center justify-center gap-2 py-3 text-[11px] uppercase tracking-[0.2em] font-medium hover:bg-foreground hover:text-background transition"
            >
              <ShoppingBag className="h-3.5 w-3.5" /> Add
            </button>
            <button
              onClick={onView}
              className="flex-1 flex items-center justify-center gap-2 py-3 text-[11px] uppercase tracking-[0.2em] font-medium border-l border-border hover:bg-foreground hover:text-background transition"
            >
              <Eye className="h-3.5 w-3.5" /> View
            </button>
          </div>
        </div>
      </Link>

      <div className="pt-2.5 sm:pt-3 flex flex-col gap-1">
        <div className="text-[9px] sm:text-[10px] uppercase tracking-[0.18em] text-muted-foreground line-clamp-1">
          {p.category_name || "BUTTERBYTE"}
        </div>
        <Link to="/p/$slug" params={{ slug: p.slug }} className="text-[13px] sm:text-sm font-medium leading-snug line-clamp-2 min-h-[2.4em] hover:text-[oklch(0.65_0.15_85)] transition">
          {p.name}
        </Link>
        <div className="flex items-baseline flex-wrap gap-x-1.5 gap-y-0.5">
          <span className="text-sm sm:text-base font-semibold">{inr(p.selling_price)}</span>
          {p.mrp > p.selling_price && (
            <span className="text-[11px] sm:text-xs text-muted-foreground line-through">{inr(p.mrp)}</span>
          )}
          {p.discount_pct > 0 && (
            <span className="text-[11px] sm:text-xs text-[oklch(0.55_0.18_140)] font-medium">({p.discount_pct}% off)</span>
          )}
        </div>

        {/* Mobile-visible action buttons */}
        <div className="md:hidden mt-2 grid grid-cols-2 gap-1.5">
          <button
            onClick={onAdd}
            className="flex items-center justify-center gap-1 py-2 bg-foreground text-background text-[10px] uppercase tracking-[0.15em] font-medium active:opacity-80 transition"
          >
            <ShoppingBag className="h-3 w-3" /> Add
          </button>
          <button
            onClick={onView}
            className="flex items-center justify-center gap-1 py-2 border border-foreground text-foreground text-[10px] uppercase tracking-[0.15em] font-medium active:bg-foreground active:text-background transition"
          >
            <Eye className="h-3 w-3" /> View
          </button>
        </div>
      </div>
    </motion.div>
  );
}
