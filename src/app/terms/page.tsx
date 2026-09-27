import type { Metadata } from "next";
import PolicyPage from "@/components/PolicyPage";

export const metadata: Metadata = { title: "Terms & Conditions — SIT WITH ME" };

export default function TermsPage() {
  return (
    <PolicyPage title="Terms & Conditions" updated="24 September 2026">
      <p>
        These Terms & Conditions govern your use of the SIT WITH ME website (sitwithme.in) and
        booking service, operated in Bangalore, India. By booking a session, you agree to these
        terms.
      </p>

      <h2>1. What we offer</h2>
      <p>
        SIT WITH ME arranges paid, platonic companionship meetups — such as café chats, walks,
        movies, or temple visits — in public places in Bangalore. This is not a dating service,
        an escort service, or a substitute for therapy or counselling.
      </p>

      <h2>2. Eligibility</h2>
      <p>
        You must be 18 years of age or older to book a session. By booking, you confirm that you
        meet this requirement.
      </p>

      <h2>3. Bookings and payment</h2>
      <ul>
        <li>A booking is confirmed only after full payment is received via Razorpay.</li>
        <li>Prices shown include the service fee and, if applicable, a travel fee for your area.</li>
        <li>Coupon codes, where applied, are deducted before payment.</li>
        <li>
          After payment, you&apos;ll pick a slot via the link provided or by coordinating with us
          on WhatsApp.
        </li>
      </ul>

      <h2>4. Cancellations and refunds</h2>
      <p>
        See our{" "}
        <a href="/refund-policy">Refund & Cancellation Policy</a> for full details.
      </p>

      <h2>5. Conduct</h2>
      <p>
        Sessions take place in public places only. Any inappropriate, abusive, or unsafe
        behaviour by either party may result in the session being ended immediately without a
        refund, and may result in a permanent ban from future bookings.
      </p>

      <h2>6. Limitation of liability</h2>
      <p>
        SIT WITH ME facilitates introductions and bookings but is not liable for the personal
        conduct of any individual outside of what is reasonably within our control. To the
        maximum extent permitted by law, our liability for any claim arising from a booking is
        limited to the amount you paid for that booking.
      </p>

      <h2>7. Changes to these terms</h2>
      <p>
        We may update these terms from time to time. Continued use of the service after an update
        means you accept the revised terms.
      </p>

      <h2>8. Governing law</h2>
      <p>
        These terms are governed by the laws of India, and disputes are subject to the exclusive
        jurisdiction of the courts in Bangalore, Karnataka.
      </p>

      <h2>9. Contact</h2>
      <p>
        Questions about these terms? See our <a href="/contact">Contact Us</a> page.
      </p>
    </PolicyPage>
  );
}
