import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { searchProducts } from "@/lib/catalog.functions";
import { inr, PLACEHOLDER_IMG } from "@/lib/format";

export function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const run = useServerFn(searchProducts);

  useEffect(() => {
    if (!open) { setQ(""); setResults([]); }
  }, [open]);

  useEffect(() => {
    if (q.length < 2) { setResults([]); return; }
    const id = setTimeout(async () => {
      const r = await run({ data: { q } });
      setResults(r.products);
    }, 200);
    return () => clearTimeout(id);
  }, [q, run]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-background mx-auto max-w-2xl mt-24 mx-4 md:mx-auto rounded-sm shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 p-4 border-b">
          <Search className="h-5 w-5 text-muted-foreground" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search sarees, kurtas, shirts..."
            className="flex-1 bg-transparent outline-none text-base"
          />
          <button onClick={onClose} aria-label="Close"><X className="h-5 w-5" /></button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto">
          {q.length >= 2 && results.length === 0 && (
            <div className="p-8 text-center text-sm text-muted-foreground">No products found.</div>
          )}
          {results.map((p) => (
            <Link key={p.id} to="/p/$slug" params={{ slug: p.slug }} onClick={onClose}
              className="flex items-center gap-4 p-3 hover:bg-muted">
              <img src={p.image_url || PLACEHOLDER_IMG} alt={p.name} className="w-14 h-16 object-cover" />
              <div className="flex-1">
                <div className="text-sm font-medium">{p.name}</div>
                <div className="text-xs text-muted-foreground">{p.category_name}</div>
              </div>
              <div className="text-sm">{inr(p.selling_price)}</div>
            </Link>
          ))}
          {q.length < 2 && (
            <div className="p-6 text-sm text-muted-foreground">
              <div className="text-xs uppercase tracking-[0.2em] mb-3">Trending</div>
              <div className="flex flex-wrap gap-2">
                {["Saree", "Kurta Set", "Lehenga", "Sherwani", "Shirt", "Dress"].map((t) => (
                  <button key={t} onClick={() => setQ(t)} className="px-3 py-1 border rounded-full hover:bg-foreground hover:text-background transition">{t}</button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
