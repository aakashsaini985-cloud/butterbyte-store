import { Link } from "@tanstack/react-router";
import { Heart, ShoppingBag, Search, Menu, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { WOMEN_CATEGORIES, MEN_CATEGORIES, SITE } from "@/lib/site";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SearchOverlay } from "@/components/search-overlay";

export function Header() {
  const { cartCount, wishCount } = useStore();
  const [openSearch, setOpenSearch] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <div className="bg-black text-[11px] tracking-[0.2em] uppercase text-white/90 py-2 text-center">
        Free shipping on prepaid orders above ₹999 &nbsp;·&nbsp; COD available &nbsp;·&nbsp; 7-day easy returns
      </div>
      <header className={`sticky top-0 z-40 bg-background transition-shadow ${scrolled ? "shadow-[0_1px_0_var(--border)]" : ""}`}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            <div className="flex items-center gap-3 md:hidden">
              <Sheet>
                <SheetTrigger aria-label="Open menu"><Menu className="h-5 w-5" /></SheetTrigger>
                <SheetContent side="left" className="w-[300px]">
                  <MobileNav />
                </SheetContent>
              </Sheet>
            </div>

            <Link to="/" className="font-display text-2xl md:text-3xl tracking-tight">
              {SITE.brand}
            </Link>

            <nav className="hidden md:flex items-center gap-8 text-sm uppercase tracking-[0.15em]">
              <Link to="/women" className="gold-underline">Women</Link>
              <Link to="/men" className="gold-underline">Men</Link>
              <Link to="/shop" search={{ filter: "new" } as any} className="gold-underline">New</Link>
              <Link to="/shop" search={{ filter: "bestsellers" } as any} className="gold-underline">Bestsellers</Link>
              <Link to="/shop" search={{ filter: "sale" } as any} className="gold-underline text-[oklch(0.78_0.13_85)]">Sale</Link>
            </nav>

            <div className="flex items-center gap-3 md:gap-5">
              <button onClick={() => setOpenSearch(true)} aria-label="Search" className="p-1"><Search className="h-5 w-5" /></button>
              <Link to="/account" aria-label="Account" className="p-1 hidden sm:block"><User className="h-5 w-5" /></Link>
              <Link to="/wishlist" aria-label="Wishlist" className="p-1 relative">
                <Heart className="h-5 w-5" />
                {wishCount > 0 && <Badge n={wishCount} />}
              </Link>
              <Link to="/cart" aria-label="Cart" className="p-1 relative">
                <ShoppingBag className="h-5 w-5" />
                {cartCount > 0 && <Badge n={cartCount} />}
              </Link>
            </div>
          </div>
        </div>
      </header>
      <SearchOverlay open={openSearch} onClose={() => setOpenSearch(false)} />
    </>
  );
}

function Badge({ n }: { n: number }) {
  return (
    <span className="absolute -top-1 -right-1 bg-[oklch(0.78_0.13_85)] text-black text-[10px] font-semibold rounded-full h-4 min-w-4 px-1 flex items-center justify-center">{n}</span>
  );
}

function MobileNav() {
  return (
    <div className="pt-4">
      <div className="font-display text-2xl mb-6">{SITE.brand}</div>
      <div className="space-y-6">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">Women</div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
            {WOMEN_CATEGORIES.map((c) => (
              <Link key={c.slug} to="/c/$gender/$slug" params={{ gender: "women", slug: c.slug }}>{c.name}</Link>
            ))}
          </div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">Men</div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
            {MEN_CATEGORIES.map((c) => (
              <Link key={c.slug} to="/c/$gender/$slug" params={{ gender: "men", slug: c.slug }}>{c.name}</Link>
            ))}
          </div>
        </div>
        <div className="border-t pt-4 space-y-2 text-sm">
          <Link to="/account" className="block">Account</Link>
          <Link to="/wishlist" className="block">Wishlist</Link>
          <Link to="/track-order" className="block">Track Order</Link>
          <Link to="/contact" className="block">Contact</Link>
        </div>
      </div>
    </div>
  );
}
