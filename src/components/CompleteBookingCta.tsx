"use client";

import { trackEvent } from "@/lib/meta/pixel";

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "919622323171";

export default function CompleteBookingCta({
  booking,
}: {
  booking: { id: string; fullName: string; serviceTitle: string; totalAmountInr: number };
}) {
  const message = encodeURIComponent(
    `Hi! Following up on my booking request (ID: ${booking.id}) for ${booking.serviceTitle}. Can I get my payment link?`,
  );

  return (
    <a
      href={`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => {
        trackEvent("AddPaymentInfo", {
          content_name: booking.serviceTitle,
          value: booking.totalAmountInr,
          currency: "INR",
        });
        trackEvent("Contact");
      }}
      className="btn-primary block w-full"
    >
      Message us on WhatsApp now
    </a>
  );
}
