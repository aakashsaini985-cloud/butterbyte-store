import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal-page";
import { SITE } from "@/lib/site";

export const Route = createFileRoute("/shipping")({
  head: () => ({ meta: [{ title: "Shipping & Delivery — BUTTERBYTE STORE" }, { name: "description", content: "Shipping charges, processing time and delivery information for BUTTERBYTE STORE orders." }] }),
  component: () => (
    <LegalPage eyebrow="Shipping" title="Shipping & Delivery">
      <p>At <strong>{SITE.company}</strong>, we strive to ensure every product reaches you safely, promptly and in perfect condition.</p>

      <h2>Processing Time</h2>
      <p>Orders are typically processed within <strong>15 business days</strong> (Monday to Saturday). Unforeseen circumstances such as high demand, holidays or courier delays may extend delivery time. We will notify you promptly if this happens.</p>

      <h2>Shipping Charges</h2>
      <ul>
        <li>National Shipping: <strong>₹150</strong> flat.</li>
        <li>Free shipping on orders above ₹1,999.</li>
      </ul>

      <h2>Shipment Tracking</h2>
      <p>Once your order is dispatched you will receive a tracking number via email. You can monitor your delivery status in real time on our <a href="/track-order">Track Order</a> page.</p>

      <h2>Delivery Locations</h2>
      <p>Orders can be delivered only to the recipient's residential or workplace address. Deliveries cannot be made to public areas such as hotels, restaurants, streets, hostels, or open locations. If the recipient is unavailable, the courier company will attempt delivery up to <strong>3 times</strong>. After that, the order will be returned to our facility.</p>

      <h2>Important Notes</h2>
      <ul>
        <li>Delivery timelines are subject to courier partner terms and conditions.</li>
        <li>Incorrect or incomplete address details may lead to delays or delivery failure.</li>
        <li>{SITE.company} reserves the right to update or modify this shipping policy at any time.</li>
      </ul>

      <h2>Payment Method</h2>
      <p>We accept all major VISA and MASTERCARD credit/debit cards, UPI and net banking through our secure payment gateway. Payments are accepted in INR. Duties and taxes are included in the product price.</p>

      <h2>Need Help?</h2>
      <p>Reach us at <a href={`mailto:${SITE.email}`}>{SITE.email}</a> or call {SITE.phone}.</p>
    </LegalPage>
  ),
});
