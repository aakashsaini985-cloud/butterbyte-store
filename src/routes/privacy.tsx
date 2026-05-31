import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal-page";
import { SITE } from "@/lib/site";

export const Route = createFileRoute("/privacy")({
  head: () => ({ meta: [{ title: "Privacy Policy — BUTTERBYTE STORE" }, { name: "description", content: "How BUTTERBYTE STORE collects, uses and protects your personal information." }] }),
  component: () => (
    <LegalPage eyebrow="Last updated: 2026-03-10" title="Privacy Policy">
      <p>We value the trust you place in <strong>{SITE.company}</strong>. We insist upon the highest standards for secure transactions and customer information privacy. Please read the following statement to learn about our information gathering and dissemination practices.</p>
      <p><em>Note: Our Privacy Policy is subject to change at any time without notice. Please review this page periodically. By using this Website, you expressly consent to our use and disclosure of your personal information in accordance with this Privacy Policy.</em></p>

      <h2>1. Collection of Personally Identifiable Information</h2>
      <p>When you use our Website, we collect and store the personal information you provide. Our primary goal is to deliver a safe, efficient and customised experience. You can browse certain sections without revealing personal information; however, once you provide personal details, you are not anonymous to us.</p>
      <p>We may automatically track certain information about you based on your behaviour on our Website, including:</p>
      <ul>
        <li>The URL you came from and the URL you visit next</li>
        <li>Your browser type and device information</li>
        <li>Your IP address</li>
      </ul>
      <p>We use cookies to analyse page flow, measure promotional effectiveness, and promote trust and safety. You may decline cookies via your browser settings, but some features may not function properly.</p>
      <p>If you choose to buy products from us, we collect billing address, payment details (processed securely via our payment gateway), and transaction tracking details. We may also store correspondence you send us for record purposes.</p>

      <h2>2. Data Retention</h2>
      <p>We retain your personal data for up to 5 years from your last interaction with our platform, or as long as required to fulfil legal, accounting, or reporting obligations. After this period, data will be securely deleted or anonymised unless legally required otherwise.</p>

      <h2>3. Use of Information</h2>
      <ul>
        <li>Provide the services you request</li>
        <li>Resolve disputes and troubleshoot issues</li>
        <li>Measure consumer interest and customise your experience</li>
        <li>Detect and prevent fraud or illegal activity</li>
        <li>Enforce our Terms &amp; Conditions</li>
      </ul>

      <h2>4. Sharing of Personal Information</h2>
      <p>We may share information with our corporate affiliates and trusted third parties strictly to deliver services, comply with legal obligations, or prevent fraud. We do <strong>not</strong> sell your personal data to third parties for marketing without your explicit consent.</p>

      <h2>5. Security Precautions</h2>
      <p>Our Website has strict security measures to protect against loss, misuse or alteration of information under our control. Whenever you change or access your account, we offer the use of a secure server.</p>

      <h2>6. Your Rights</h2>
      <p>You may request access to, correction of, or deletion of your personal information at any time by emailing <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.</p>

      <h2>7. Contact Us</h2>
      <p>For any questions about this Privacy Policy, write to {SITE.company} at <a href={`mailto:${SITE.email}`}>{SITE.email}</a> or call {SITE.phone}.</p>
    </LegalPage>
  ),
});
