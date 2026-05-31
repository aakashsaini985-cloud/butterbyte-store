import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal-page";
import { SITE } from "@/lib/site";

export const Route = createFileRoute("/terms")({
  head: () => ({ meta: [{ title: "Terms & Conditions — BUTTERBYTE STORE" }, { name: "description", content: "The terms governing your use of the BUTTERBYTE STORE website and services." }] }),
  component: () => (
    <LegalPage eyebrow="Legal" title="Terms & Conditions">
      <p>Welcome to <strong>{SITE.company}</strong>. By visiting our site and/or purchasing from us, you engage in our "Service" and agree to be bound by the following Terms of Service. These Terms apply to all users of the site, including browsers, vendors, customers, and contributors of content. If you do not agree to these Terms, please do not use our website or services.</p>
      <p>We may update, modify, or replace any part of these Terms at our sole discretion by posting changes on this page. Continued use of our site after changes means you accept the updated Terms.</p>

      <h2>Our Services</h2>
      <p>{SITE.company} provides an online shopping platform for premium fashion and lifestyle products.</p>
      <ul>
        <li><strong>Product Display:</strong> Images shown are for reference only. Due to lighting, screen resolution, and photography methods, the product may appear slightly different in size or colour than displayed.</li>
        <li><strong>Handmade Craftsmanship:</strong> Many of our products are handcrafted; minor variations are natural and reflect the uniqueness of each item.</li>
        <li><strong>Measurements:</strong> We provide product dimensions where possible. If sizing details are missing, please contact us before ordering.</li>
      </ul>

      <h2>Account Registration</h2>
      <p>Customers may create an account to shop conveniently. During registration, you will share certain personal details (name, email, contact number) as per our Privacy Policy. You are responsible for maintaining the confidentiality of your account credentials.</p>

      <h2>Orders &amp; Confirmation</h2>
      <p>To place an order, add items to the cart and proceed to checkout. Orders will only be processed once full payment is received. You will receive an order confirmation email upon successful purchase. We reserve the right to cancel any order in case of payment issues, stock unavailability, or misuse of promotional offers.</p>

      <h2>Pricing &amp; Payment</h2>
      <p>All prices are listed in INR and include applicable taxes unless stated otherwise. We accept major credit/debit cards, UPI, net banking, and select wallets through our secure payment gateway.</p>

      <h2>Intellectual Property</h2>
      <p>All content on this site — including images, logos, designs, text and graphics — is the property of {SITE.company} and protected under applicable copyright and trademark laws. Reuse without written permission is prohibited.</p>

      <h2>Limitation of Liability</h2>
      <p>{SITE.company} shall not be liable for any indirect, incidental, special or consequential damages arising from your use of, or inability to use, our Website or products.</p>

      <h2>Governing Law</h2>
      <p>These Terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts of New Delhi.</p>

      <h2>Contact</h2>
      <p>Questions about the Terms should be sent to <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.</p>
    </LegalPage>
  ),
});
