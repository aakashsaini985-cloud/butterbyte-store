import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal-page";
import { SITE } from "@/lib/site";

export const Route = createFileRoute("/refund")({
  head: () => ({ meta: [{ title: "Returns & Refunds — BUTTERBYTE STORE" }, { name: "description", content: "Hassle-free returns, exchanges and refunds at BUTTERBYTE STORE." }] }),
  component: () => (
    <LegalPage eyebrow="Returns" title="Returns & Refunds">
      <p>At <strong>{SITE.company}</strong>, we want you to shop with confidence. That's why we offer a <strong>Hassle-Free Return Policy</strong> and a <strong>7-Day Exchange Policy</strong>.</p>

      <h2>Damaged or Tampered Package</h2>
      <p>If you receive a package that is damaged, tampered with, or in poor condition, please <strong>refuse to accept it</strong>. Record a video and take at least 2–4 clear photos of the package, then email them to <a href={`mailto:${SITE.email}`}>{SITE.email}</a> within <strong>24 hours of delivery</strong>. We will send a replacement at no additional cost. Returns without prior communication and verification may not be accepted.</p>

      <h2>Product Damage or Error</h2>
      <p>If the product itself is damaged or has any error, please record a clear unboxing video along with photos and email them within <strong>24 hours of delivery</strong>. Once verified, we will:</p>
      <ul>
        <li>Arrange a pickup of the defective item.</li>
        <li>Provide a replacement or refund, based on stock availability.</li>
      </ul>

      <h2>Wrong Product Delivered</h2>
      <p>If you receive a product different from what you ordered, share an unboxing video and clear photos within 24 hours. Once verified, we will arrange pickup and ship the correct product (subject to stock). If unavailable, a credit of equal value will be issued.</p>

      <h2>Quality Check &amp; Lab Test</h2>
      <p>Returned products undergo a quality check to ensure they were not exposed to perfume, chemicals, or misuse. If care instructions were not followed, we will be unable to provide a refund or replacement.</p>

      <h2>Important Notes</h2>
      <ul>
        <li><strong>Mandatory Unboxing Video &amp; Photos:</strong> Returns/exchanges are processed only if both are shared via email within 24–48 hours.</li>
        <li><strong>Stock Availability:</strong> Exchanges depend on stock. If unavailable, a credit note will be issued.</li>
        <li><strong>Shipping Charges:</strong> Customers bear a ₹150 return shipping fee for valid returns/exchanges.</li>
        <li>Discounts are not applicable on exchanged items.</li>
      </ul>

      <h2>Refund Timeline</h2>
      <p>Once approved, refunds are credited to the original payment method within <strong>7–10 business days</strong>.</p>

      <h2>Contact</h2>
      <p>For any return-related queries, email <a href={`mailto:${SITE.email}`}>{SITE.email}</a> or call {SITE.phone}.</p>
    </LegalPage>
  ),
});
