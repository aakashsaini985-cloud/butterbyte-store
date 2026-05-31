import { createFileRoute } from "@tanstack/react-router";
import { Mail, Phone, MapPin } from "lucide-react";
import { LegalPage } from "@/components/legal-page";
import { SITE } from "@/lib/site";

export const Route = createFileRoute("/contact")({
  head: () => ({ meta: [{ title: "Contact Us — BUTTERBYTE STORE" }, { name: "description", content: "Get in touch with BUTTERBYTE STORE — call, email or visit us in Shakarpur, East Delhi." }] }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <LegalPage eyebrow="Get in touch" title="Contact Us">
      <p>We'd love to hear from you. Reach out for orders, sizing help, custom requests, or anything else — our team usually responds within 24 hours.</p>
      <div className="not-prose mt-8 grid sm:grid-cols-3 gap-4">
        <a href={`tel:${SITE.phone.replace(/\s/g, "")}`} className="border p-5 hover:bg-foreground hover:text-background transition group">
          <Phone className="h-5 w-5 text-[oklch(0.78_0.13_85)] group-hover:text-background" />
          <div className="text-xs uppercase tracking-[0.2em] mt-3 opacity-70">Phone</div>
          <div className="mt-1 font-medium">{SITE.phone}</div>
        </a>
        <a href={`mailto:${SITE.email}`} className="border p-5 hover:bg-foreground hover:text-background transition group">
          <Mail className="h-5 w-5 text-[oklch(0.78_0.13_85)] group-hover:text-background" />
          <div className="text-xs uppercase tracking-[0.2em] mt-3 opacity-70">Email</div>
          <div className="mt-1 font-medium break-all">{SITE.email}</div>
        </a>
        <div className="border p-5">
          <MapPin className="h-5 w-5 text-[oklch(0.78_0.13_85)]" />
          <div className="text-xs uppercase tracking-[0.2em] mt-3 opacity-70">Address</div>
          <div className="mt-1 text-sm">{SITE.address}</div>
        </div>
      </div>
      <h2>Customer Care Hours</h2>
      <p>Monday – Saturday, 10:00 AM – 7:00 PM IST. We are closed on national holidays.</p>
      <h2>Business Enquiries</h2>
      <p>For wholesale, collaborations or press, please email <a href={`mailto:${SITE.email}`}>{SITE.email}</a> with the subject line "Business Enquiry".</p>
    </LegalPage>
  );
}
