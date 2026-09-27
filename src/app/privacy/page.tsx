import type { Metadata } from "next";
import PolicyPage from "@/components/PolicyPage";

export const metadata: Metadata = { title: "Privacy Policy — SIT WITH ME" };

export default function PrivacyPage() {
  return (
    <PolicyPage title="Privacy Policy" updated="24 September 2026">
      <p>
        This Privacy Policy explains what information SIT WITH ME collects when you book a
        session, and how we use it.
      </p>

      <h2>1. Information we collect</h2>
      <ul>
        <li>Your full name, WhatsApp number, and email address</li>
        <li>Your area in Bangalore, and any notes you share about your preferred date/time</li>
        <li>
          Payment details are handled entirely by Razorpay — we never see or store your card,
          UPI, or bank details
        </li>
      </ul>

      <h2>2. How we use it</h2>
      <ul>
        <li>To confirm and coordinate your booking</li>
        <li>To process payment securely via Razorpay</li>
        <li>To send you a booking confirmation and payment receipt by email</li>
        <li>To contact you on WhatsApp about your session</li>
      </ul>

      <h2>3. Who we share it with</h2>
      <p>
        We share the minimum necessary information with the service providers that power this
        website: Razorpay (payments), Resend (transactional email), and Supabase (database
        hosting). We do not sell your information to anyone.
      </p>

      <h2>4. How long we keep it</h2>
      <p>
        We retain booking records for as long as needed for accounting, dispute resolution, and
        legal compliance.
      </p>

      <h2>5. Your rights</h2>
      <p>
        You can ask us to delete your personal information at any time by messaging us on
        WhatsApp or emailing us — see <a href="/contact">Contact Us</a>.
      </p>

      <h2>6. Security</h2>
      <p>
        Your data is stored with access controls, and all payments are processed through
        Razorpay&apos;s PCI-DSS compliant checkout — we never handle your card or bank details
        directly.
      </p>
    </PolicyPage>
  );
}
