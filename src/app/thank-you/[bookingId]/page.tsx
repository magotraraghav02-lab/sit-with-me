import { createServiceRoleClient } from "@/lib/supabase/server";
import type { PaymentBooking } from "@/lib/types";
import ConfettiBurst from "@/components/ConfettiBurst";
import ReferralShare from "@/components/ReferralShare";
import WhatsAppButton from "@/components/WhatsAppButton";

export const dynamic = "force-dynamic";

export default async function ThankYouPage({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const { bookingId } = await params;
  const db = createServiceRoleClient();
  const { data: booking } = await db
    .from("payment_bookings")
    .select("*")
    .eq("id", bookingId)
    .maybeSingle();

  const b = booking as PaymentBooking | null;

  let calendlyLink: string | null = null;
  if (b?.pricing_id) {
    const { data: pricing } = await db
      .from("pricing")
      .select("calendly_link")
      .eq("id", b.pricing_id)
      .maybeSingle();
    calendlyLink = pricing?.calendly_link ?? null;
  }

  const isPaid = b?.status === "Paid";

  return (
    <main className="flex min-h-screen items-center justify-center bg-sand px-5 py-16">
      {isPaid && <ConfettiBurst />}
      <div className="card w-full max-w-md p-8 text-center">
        {!b ? (
          <p className="text-ink">We couldn&apos;t find that booking.</p>
        ) : isPaid ? (
          <>
            <p className="mb-2 text-4xl">🎉</p>
            <h1 className="mb-1 text-2xl font-semibold text-forest">You&apos;re booked!</h1>
            <p className="mb-6 text-sm text-muted">
              {b.pricing_title_snapshot} · ₹{b.total_amount_inr.toLocaleString("en-IN")}
            </p>
            <div className="mb-6 space-y-2 rounded-xl bg-sand p-4 text-left text-sm text-ink">
              <p className="font-medium">Next steps</p>
              {calendlyLink ? (
                <a href={calendlyLink} target="_blank" rel="noopener noreferrer" className="block underline">
                  1. Pick your slot →
                </a>
              ) : (
                <p>1. We&apos;ll WhatsApp you to pick a time.</p>
              )}
              <p>2. Meet in a public place, 18+, real names and faces.</p>
            </div>
            <div className="space-y-3">
              <ReferralShare bookingId={b.id} />
            </div>
          </>
        ) : (
          <>
            <p className="mb-2 text-3xl">⏳</p>
            <h1 className="mb-1 text-xl font-semibold text-ink">Not paid yet</h1>
            <p className="text-sm text-muted">
              This booking is still {b.status.toLowerCase()}. If you were expecting to see it paid
              here, message us on WhatsApp and we&apos;ll check.
            </p>
          </>
        )}
      </div>
      <WhatsAppButton />
    </main>
  );
}
