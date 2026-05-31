import { Link } from "@tanstack/react-router";
import { Heart, ShoppingBag, Search, Menu, User, ChevronDown } from "lucide-react";
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
      <div className="bg-black text-[10px] sm:text-[11px] tracking-[0.2em] uppercase text-white/90 py-2 text-center px-3">
        Free shipping on prepaid orders above ₹999 · 7-day returns
      </div>
      <header className={`sticky top-0 z-40 bg-background transition-shadow ${scrolled ? "shadow-[0_1px_0_var(--border)]" : ""}`}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 md:h-16 gap-3">
            <div className="flex items-center gap-2 md:gap-4">
              <Sheet>
                <SheetTrigger aria-label="Open menu" className="p-1 -ml-1 hover:text-[oklch(0.78_0.13_85)] transition">
                  <Menu className="h-6 w-6" />
                </SheetTrigger>
                <SheetContent side="left" className="w-[320px] sm:w-[360px] overflow-y-auto p-0">
                  <SidebarNav />
                </SheetContent>
              </Sheet>
              <Link to="/" className="font-display font-bold text-lg md:text-xl tracking-tight">
                {SITE.brand}
              </Link>
            </div>

            <div className="flex items-center gap-3 md:gap-4">
              <button onClick={() => setOpenSearch(true)} aria-label="Search" className="p-1 hover:text-[oklch(0.78_0.13_85)] transition"><Search className="h-5 w-5" /></button>
              <Link to="/account" aria-label="Account" className="p-1 hidden sm:block hover:text-[oklch(0.78_0.13_85)] transition"><User className="h-5 w-5" /></Link>
              <Link to="/wishlist" aria-label="Wishlist" className="p-1 relative hover:text-[oklch(0.78_0.13_85)] transition">
                <Heart className="h-5 w-5" />
                {wishCount > 0 && <Badge n={wishCount} />}
              </Link>
              <Link to="/cart" aria-label="Cart" className="p-1 relative hover:text-[oklch(0.78_0.13_85)] transition">
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

function SidebarNav() {
  const [openMen, setOpenMen] = useState(false);
  const [openWomen, setOpenWomen] = useState(false);
  const linkCls = "block py-2.5 text-sm hover:text-[oklch(0.65_0.15_85)] hover:underline underline-offset-4 decoration-[oklch(0.78_0.13_85)] decoration-2 transition";
  return (
    <div className="flex flex-col h-full">
      <div className="px-6 pt-8 pb-4 border-b">
        <div className="font-display font-bold text-xl">{SITE.brand}</div>
        <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mt-1">Modern Indian Fashion</div>
      </div>
      <nav className="px-6 py-4 flex-1">
        <Link to="/" className={linkCls}>Home</Link>
        <Link to="/shop" className={linkCls}>Shop</Link>

        <button onClick={() => setOpenMen((v) => !v)} className={`${linkCls} flex items-center justify-between w-full`}>
          <span>Men</span><ChevronDown className={`h-4 w-4 transition-transform ${openMen ? "rotate-180" : ""}`} />
        </button>
        {openMen && (
          <div className="pl-4 border-l border-border ml-1 mb-2">
            {MEN_CATEGORIES.map((c) => (
              <Link key={c.slug} to="/c/$gender/$slug" params={{ gender: "men", slug: c.slug }} className="block py-1.5 text-sm text-muted-foreground hover:text-[oklch(0.65_0.15_85)] transition">{c.name}</Link>
            ))}
          </div>
        )}

        <button onClick={() => setOpenWomen((v) => !v)} className={`${linkCls} flex items-center justify-between w-full`}>
          <span>Women</span><ChevronDown className={`h-4 w-4 transition-transform ${openWomen ? "rotate-180" : ""}`} />
        </button>
        {openWomen && (
          <div className="pl-4 border-l border-border ml-1 mb-2">
            {WOMEN_CATEGORIES.map((c) => (
              <Link key={c.slug} to="/c/$gender/$slug" params={{ gender: "women", slug: c.slug }} className="block py-1.5 text-sm text-muted-foreground hover:text-[oklch(0.65_0.15_85)] transition">{c.name}</Link>
            ))}
          </div>
        )}

        <Link to="/shop" search={{ filter: "bestsellers" } as any} className={linkCls}>Best Sellers</Link>
        <Link to="/shop" search={{ filter: "sale" } as any} className={`${linkCls} text-[oklch(0.65_0.18_30)]`}>Sale</Link>
        <div className="my-3 border-t" />
        <Link to="/about" className={linkCls}>About Us</Link>
        <Link to="/contact" className={linkCls}>Contact Us</Link>
        <Link to="/track-order" className={linkCls}>Track Order</Link>
        <Link to="/faq" className={linkCls}>FAQs</Link>
        <Link to="/account" className={linkCls}>My Account</Link>
      </nav>
      <div className="px-6 py-4 border-t text-xs text-muted-foreground">
        <div>{SITE.email}</div>
        <div>{SITE.phone}</div>
      </div>
    </div>
  );
}
