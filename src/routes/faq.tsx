import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal-page";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const FAQS = [
  { q: "How long does delivery take?", a: "Orders are processed within 15 business days. Once shipped, you'll receive a tracking number via email so you can follow your parcel in real time." },
  { q: "What are the shipping charges?", a: "A flat shipping fee of ₹150 applies across India. Orders above ₹1,999 ship free." },
  { q: "Do you ship internationally?", a: "Currently we ship only within India. International shipping will be announced soon — subscribe to our newsletter for updates." },
  { q: "How do I track my order?", a: "Visit the Track Order page and enter your order number and email. You'll also receive tracking links by email after dispatch." },
  { q: "What is your return and exchange policy?", a: "We offer a hassle-free 7-day exchange policy. Please share an unboxing video and clear photos within 24 hours of delivery to qualify." },
  { q: "How do I get a refund?", a: "Once your return is received and verified, refunds are credited to your original payment method within 7–10 business days." },
  { q: "Are the colours and sizes accurate?", a: "We do our best to display accurate colours, but slight variations may occur due to screen settings and lighting. Detailed size charts are available on every product page." },
  { q: "Do you take custom or bulk orders?", a: "Yes. For custom stitching, wedding orders or wholesale enquiries, email us at communication@butterbytestore.com." },
  { q: "Which payment methods do you accept?", a: "We accept all major VISA / Mastercard credit and debit cards, UPI, net banking and popular wallets via our secure payment gateway." },
  { q: "Is it safe to shop on BUTTERBYTE STORE?", a: "Absolutely. All payments are processed through PCI-DSS compliant gateways, and your personal data is protected under our Privacy Policy." },
  { q: "How do I care for my outfit?", a: "Each product comes with a care card. As a rule of thumb, dry-clean ethnic wear, wash delicate fabrics by hand in cold water, and store in a cool dry place." },
  { q: "How can I contact customer support?", a: "Call us at +91 8302628498 or email communication@butterbytestore.com. Our team is available Mon–Sat, 10 AM – 7 PM IST." },
];

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — BUTTERBYTE STORE" },
      { name: "description", content: "Answers to common questions about orders, shipping, returns, payments and sizing at BUTTERBYTE STORE." },
    ],
  }),
  component: () => (
    <LegalPage eyebrow="Help center" title="Frequently Asked Questions">
      <p>Quick answers to the questions we hear most often. Can't find what you need? Email <a href="mailto:communication@butterbytestore.com">communication@butterbytestore.com</a> and we'll get back to you within 24 hours.</p>
      <div className="not-prose mt-8">
        <Accordion type="single" collapsible className="w-full">
          {FAQS.map((f, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger className="text-left text-base">{f.q}</AccordionTrigger>
              <AccordionContent className="text-foreground/75 leading-relaxed">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </LegalPage>
  ),
});
