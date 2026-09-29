import { createServiceRoleClient } from "@/lib/supabase/server";
import type { PaymentBooking } from "@/lib/types";
import WhatsAppButton from "@/components/WhatsAppButton";
import CompleteBookingCta from "@/components/CompleteBookingCta";

export const dynamic = "force-dynamic";

export default async function CompleteBookingPage({
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

  return (
    <main className="flex min-h-screen items-center justify-center bg-sand px-5 py-16">
      <div className="card w-full max-w-md p-8 text-center">
        {!b ? (
          <p className="text-ink">We couldn&apos;t find that booking.</p>
        ) : b.status === "Paid" ? (
          <>
            <p className="mb-1 text-3xl">✅</p>
            <h1 className="mb-2 text-xl font-semibold text-forest">Already paid!</h1>
            <p className="text-sm text-muted">
              Your {b.pricing_title_snapshot} booking is confirmed. We&apos;ll be in touch to lock
              in a time.
            </p>
          </>
        ) : (
          <>
            <h1 className="mb-1 text-xl font-semibold text-ink">Finish your booking</h1>
            <p className="mb-4 text-sm text-muted">Booking ID: {b.id.slice(0, 8).toUpperCase()}</p>
            <div className="mb-5 rounded-xl bg-sand p-4 text-left text-sm text-ink">
              <div className="flex justify-between">
                <span>{b.pricing_title_snapshot}</span>
                <span>₹{b.total_amount_inr.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-muted">
                <span>Area</span>
                <span>{b.area}</span>
              </div>
            </div>
            <CompleteBookingCta booking={{ id: b.id, fullName: b.full_name, serviceTitle: b.pricing_title_snapshot, totalAmountInr: b.total_amount_inr }} />
          </>
        )}
      </div>
      <WhatsAppButton />
    </main>
  );
}
