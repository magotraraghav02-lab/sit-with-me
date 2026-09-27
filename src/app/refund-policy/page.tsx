import type { Metadata } from "next";
import PolicyPage from "@/components/PolicyPage";

export const metadata: Metadata = { title: "Refund & Cancellation Policy — SIT WITH ME" };

export default function RefundPolicyPage() {
  return (
    <PolicyPage title="Refund & Cancellation Policy" updated="24 September 2026">
      <h2>Cancelling your booking</h2>
      <ul>
        <li>
          <strong>12 hours or more before your session:</strong> full refund, processed back to
          your original payment method via Razorpay.
        </li>
        <li>
          <strong>Less than 12 hours before your session, or a no-show:</strong> no refund.
        </li>
        <li>
          <strong>Session ended early due to inappropriate behaviour</strong> by the customer: no
          refund.
        </li>
      </ul>

      <h2>How to request a cancellation or refund</h2>
      <p>
        Message us on WhatsApp with your Booking ID as early as possible. We&apos;ll confirm
        whether you&apos;re eligible for a refund based on the timing above.
      </p>

      <h2>Refund processing time</h2>
      <p>
        Approved refunds are issued via Razorpay to your original payment method and typically
        appear within 5–7 business days, depending on your bank or payment provider.
      </p>

      <h2>Partial refunds</h2>
      <p>
        In some cases (for example, a session shortened for reasons on our end) we may issue a
        partial refund at our discretion.
      </p>

      <h2>Questions</h2>
      <p>
        See our <a href="/contact">Contact Us</a> page to reach us.
      </p>
    </PolicyPage>
  );
}
