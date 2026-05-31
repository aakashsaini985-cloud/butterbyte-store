import { ReactNode } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export function LegalPage({ title, eyebrow, children }: { title: string; eyebrow?: string; children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-6 pt-14 md:pt-20 pb-6">
          {eyebrow && <div className="text-[10px] tracking-[0.3em] uppercase text-[oklch(0.78_0.13_85)]">{eyebrow}</div>}
          <h1 className="font-display text-4xl md:text-5xl mt-3 leading-tight">{title}</h1>
        </section>
        <section className="mx-auto max-w-3xl px-6 pb-20 legal-content">
          {children}
        </section>
      </main>
      <Footer />
    </div>
  );
}
