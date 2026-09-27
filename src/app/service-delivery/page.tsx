import type { Metadata } from "next";
import Link from "next/link";
import PolicyPage from "@/components/PolicyPage";

export const metadata: Metadata = { title: "Service Delivery Policy — SIT WITH ME" };

export default function ServiceDeliveryPage() {
  return (
    <PolicyPage title="Service Delivery Policy" updated="24 September 2026">
      <p>
        SIT WITH ME is a service, not a physical product — here&apos;s exactly how it&apos;s
        delivered once you&apos;ve paid.
      </p>

      <h2>1. After payment</h2>
      <p>
        As soon as your payment is confirmed, you&apos;ll see your Booking ID on screen and
        receive a confirmation email. There is nothing to ship — your session is scheduled, not
        delivered as a physical good.
      </p>

      <h2>2. Scheduling your session</h2>
      <p>
        Use the &quot;Pick your slot&quot; link on the confirmation screen (where available), or
        message us on WhatsApp with your Booking ID, to agree on a date, time, and public meeting
        place.
      </p>

      <h2>3. What&apos;s included</h2>
      <ul>
        <li>The companion&apos;s time for the duration you booked</li>
        <li>Coordination and confirmation of your meetup</li>
      </ul>

      <h2>4. What&apos;s not included</h2>
      <p>
        You cover your own food, tickets, and travel during the session, unless stated otherwise.
      </p>

      <h2>5. Where sessions happen</h2>
      <p>
        All sessions take place in public places in Bangalore only (cafés, parks, malls, and
        similar) — see our <Link href="/" className="underline">Do&apos;s and Don&apos;ts</Link>{" "}
        section for details.
      </p>

      <h2>6. If something changes</h2>
      <p>
        If a companion becomes unavailable after your payment, we&apos;ll offer you an
        alternative slot, a different companion, or a full refund.
      </p>
    </PolicyPage>
  );
}
