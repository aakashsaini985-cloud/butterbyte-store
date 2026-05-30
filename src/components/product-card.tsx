import { Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { motion } from "framer-motion";
import { inr, PLACEHOLDER_IMG } from "@/lib/format";
import type { ProductCard as P } from "@/lib/catalog.functions";
import { wishlist, useStore } from "@/lib/store";

export function ProductCard({ p, eager = false }: { p: P; eager?: boolean }) {
  const { wishIds } = useStore();
  const wished = wishIds.includes(p.id);
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4 }}
      className="group"
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
            <div className="absolute top-3 left-3 bg-black text-white text-[10px] tracking-widest uppercase px-2 py-1">
              {p.discount_pct}% off
            </div>
          )}
          <button
            aria-label="Wishlist"
            onClick={(e) => { e.preventDefault(); wishlist.toggle(p.id); }}
            className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white rounded-full transition"
          >
            <Heart className={`h-4 w-4 ${wished ? "fill-[oklch(0.78_0.13_85)] text-[oklch(0.78_0.13_85)]" : ""}`} />
          </button>
        </div>
        <div className="pt-3 space-y-1">
          <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{p.category_name || "BUTTERBYTE"}</div>
          <div className="text-sm font-medium line-clamp-1">{p.name}</div>
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-semibold">{inr(p.selling_price)}</span>
            {p.mrp > p.selling_price && <span className="text-xs text-muted-foreground line-through">{inr(p.mrp)}</span>}
            {p.discount_pct > 0 && <span className="text-xs text-[oklch(0.55_0.18_140)]">({p.discount_pct}% off)</span>}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
