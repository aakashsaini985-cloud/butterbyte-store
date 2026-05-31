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
        <section className="mx-auto max-w-3xl px-6 pb-20 prose prose-neutral max-w-none prose-headings:font-display prose-headings:font-normal prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-3 prose-h3:text-lg prose-p:leading-relaxed prose-p:text-foreground/80 prose-li:text-foreground/80 prose-a:text-foreground prose-strong:text-foreground">
          {children}
        </section>
      </main>
      <Footer />
    </div>
  );
}
