import { Link } from "@tanstack/react-router";
import { SITE, WOMEN_CATEGORIES, MEN_CATEGORIES } from "@/lib/site";
import { Mail, Phone, MapPin, Instagram, Facebook } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-black text-white/90 mt-24">
      <div className="mx-auto max-w-7xl px-6 py-16 grid gap-10 md:grid-cols-5">
        <div className="md:col-span-2 space-y-4">
          <div className="font-display text-3xl text-white">{SITE.brand}</div>
          <p className="text-sm text-white/60 max-w-sm">{SITE.tagline}. By {SITE.company}. Designed in India, built for the world.</p>
          <div className="flex gap-3 pt-2">
            <a href="#" aria-label="Instagram" className="p-2 rounded-full border border-white/15 hover:border-[oklch(0.78_0.13_85)] hover:text-[oklch(0.78_0.13_85)] transition"><Instagram className="h-4 w-4" /></a>
            <a href="#" aria-label="Facebook" className="p-2 rounded-full border border-white/15 hover:border-[oklch(0.78_0.13_85)] hover:text-[oklch(0.78_0.13_85)] transition"><Facebook className="h-4 w-4" /></a>
          </div>
        </div>
        <FooterCol title="Women">
          {WOMEN_CATEGORIES.slice(0, 6).map((c) => (
            <Link key={c.slug} to="/c/$gender/$slug" params={{ gender: "women", slug: c.slug }}>{c.name}</Link>
          ))}
        </FooterCol>
        <FooterCol title="Men">
          {MEN_CATEGORIES.slice(0, 6).map((c) => (
            <Link key={c.slug} to="/c/$gender/$slug" params={{ gender: "men", slug: c.slug }}>{c.name}</Link>
          ))}
        </FooterCol>
        <FooterCol title="Help">
          <Link to="/about">About Us</Link>
          <Link to="/contact">Contact Us</Link>
          <Link to="/shipping">Shipping Policy</Link>
          <Link to="/refund">Returns & Refunds</Link>
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/terms">Terms & Conditions</Link>
          <Link to="/faq">FAQ</Link>
          <Link to="/track-order">Track Order</Link>
        </FooterCol>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-8 grid gap-6 md:grid-cols-3 text-sm text-white/60">
          <div className="flex items-start gap-2"><MapPin className="h-4 w-4 mt-0.5 text-[oklch(0.78_0.13_85)]" /><span>{SITE.address}</span></div>
          <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-[oklch(0.78_0.13_85)]" /><a href={`mailto:${SITE.email}`} className="hover:text-white">{SITE.email}</a></div>
          <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-[oklch(0.78_0.13_85)]" /><a href={`tel:${SITE.phone.replace(/\s/g, "")}`} className="hover:text-white">{SITE.phone}</a></div>
        </div>
        <div className="mx-auto max-w-7xl px-6 py-6 border-t border-white/10 text-xs text-white/40 flex flex-col md:flex-row gap-2 md:justify-between">
          <div>© {new Date().getFullYear()} {SITE.company} · CIN: {SITE.cin}</div>
          <div>All rights reserved.</div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-[0.2em] text-white mb-4">{title}</div>
      <div className="flex flex-col gap-2 text-sm text-white/60 [&>*]:hover:text-white [&>*]:transition">{children}</div>
    </div>
  );
}
