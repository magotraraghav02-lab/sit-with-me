import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { paymentProvider, sha256Hex, paiseToRupees } from "@/lib/payments";
import { normalizeIndianMobile } from "@/lib/validation";
import { sendPaymentConfirmationEmail, sendPaymentAlertEmail } from "@/lib/email";
import { sendMetaEvent } from "@/lib/meta/capi";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { PaymentBooking } from "@/lib/types";

// Purchase only ever fires from here -- after Razorpay's own signed webhook
// has confirmed money actually moved. There is no client-side Purchase event
// anywhere in this codebase, by design: the customer pays on Razorpay's own
// hosted page (payment link), never back on ours, so a browser-side fire
// would either never happen or would have to be faked. CAPI-only is correct
// and is Meta's own recommended pattern for exactly this "offline/redirect"
// conversion shape.
async function trackPurchase(booking: PaymentBooking) {
  await sendMetaEvent({
    eventName: "Purchase",
    eventId: `purchase_${booking.id}`,
    eventSourceUrl: booking.landing_page
      ? `https://sitwithme.in${booking.landing_page}`
      : "https://sitwithme.in",
    userData: {
      phone: booking.whatsapp,
      email: booking.email,
      fbp: booking.fbp,
      fbc: booking.fbc,
    },
    customData: {
      currency: booking.currency,
      value: booking.total_amount_inr,
      content_name: booking.pricing_title_snapshot,
      content_ids: booking.pricing_id ? [booking.pricing_id] : undefined,
      content_type: "product",
    },
  });
}

// Razorpay webhooks are the source of truth for payment state. Signature is
// verified against the RAW request body (never the parsed JSON), and every
// event is deduped via razorpay_webhook_events before any side effect runs,
// so a retried delivery can never double-apply an update.

export const runtime = "nodejs";

type RazorpayWebhookPayload = {
  event?: string;
  payload?: {
    payment?: { entity?: Record<string, unknown> };
    refund?: { entity?: Record<string, unknown> };
    payment_link?: { entity?: Record<string, unknown> };
  };
};

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature");

  if (!signature || !paymentProvider.verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let payload: RazorpayWebhookPayload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const eventType = payload.event ?? "unknown";
  const eventId = sha256Hex(rawBody);
  const db = createServiceRoleClient();

  // Claim this event. A unique-key violation here means we've already
  // processed this exact delivery -- ack and stop, no side effects re-run.
  const { error: dedupeError } = await db
    .from("razorpay_webhook_events")
    .insert({ id: eventId, event_type: eventType });

  if (dedupeError) {
    return NextResponse.json({ ok: true, deduped: true });
  }

  try {
    if (eventType === "payment.captured") {
      await handlePaymentCaptured(db, payload.payload?.payment?.entity);
    } else if (eventType === "payment.failed") {
      await handlePaymentFailed(db, payload.payload?.payment?.entity);
    } else if (eventType === "refund.processed") {
      await handleRefundProcessed(db, payload.payload?.refund?.entity);
    } else if (eventType === "payment_link.paid") {
      await handlePaymentLinkPaid(
        db,
        payload.payload?.payment_link?.entity,
        payload.payload?.payment?.entity,
      );
    }
  } catch (err) {
    console.error("razorpay webhook handler error", eventType, err);
  }

  return NextResponse.json({ ok: true });
}

async function findBookingByOrderId(
  db: SupabaseClient,
  orderId: string,
): Promise<PaymentBooking | null> {
  const { data } = await db
    .from("payment_bookings")
    .select("*")
    .eq("razorpay_order_id", orderId)
    .maybeSingle();
  return data ?? null;
}

async function getCalendlyLink(db: SupabaseClient, pricingId: string | null) {
  if (!pricingId) return null;
  const { data } = await db
    .from("pricing")
    .select("calendly_link")
    .eq("id", pricingId)
    .maybeSingle();
  return data?.calendly_link ?? null;
}

async function handlePaymentCaptured(
  db: SupabaseClient,
  entity: Record<string, unknown> | undefined,
) {
  const orderId = entity?.order_id as string | undefined;
  const paymentId = entity?.id as string | undefined;
  if (!orderId || !paymentId) return;

  const booking = await findBookingByOrderId(db, orderId);
  if (!booking) return;
  if (booking.status === "Paid") return; // already handled (e.g. by the client-side verify call)

  const { data: updated } = await db
    .from("payment_bookings")
    .update({
      status: "Paid",
      razorpay_payment_id: paymentId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", booking.id)
    .select("*")
    .single();

  const finalBooking = updated ?? booking;
  const calendlyLink = await getCalendlyLink(db, finalBooking.pricing_id);

  await Promise.all([
    sendPaymentConfirmationEmail({
      toEmail: finalBooking.email ?? "",
      fullName: finalBooking.full_name,
      bookingId: finalBooking.id,
      serviceTitle: finalBooking.pricing_title_snapshot,
      totalAmountInr: finalBooking.total_amount_inr,
      calendlyLink,
    }),
    sendPaymentAlertEmail({
      fullName: finalBooking.full_name,
      whatsapp: finalBooking.whatsapp,
      serviceTitle: finalBooking.pricing_title_snapshot,
      totalAmountInr: finalBooking.total_amount_inr,
      bookingId: finalBooking.id,
    }),
    trackPurchase(finalBooking),
  ]);
}

async function findBookingByPaymentLinkId(
  db: SupabaseClient,
  paymentLinkId: string,
): Promise<PaymentBooking | null> {
  const { data } = await db
    .from("payment_bookings")
    .select("*")
    .eq("razorpay_payment_link_id", paymentLinkId)
    .maybeSingle();
  return data ?? null;
}

// Fallback match for links created by hand in the Razorpay app/dashboard
// (an Individual account has no live API key, so we never got a plink_id to
// store up front). We match the oldest still-Pending booking with the same
// phone number and the same amount -- both are required fields on any
// Razorpay Payment Link, so this is reliable for normal, low-volume use.
async function findPendingBookingByContactAndAmount(
  db: SupabaseClient,
  contact: string | undefined,
  amountInPaise: number | undefined,
): Promise<PaymentBooking | null> {
  if (!contact || typeof amountInPaise !== "number") return null;
  const whatsapp = normalizeIndianMobile(contact);
  const amountInr = Math.round(amountInPaise) / 100;

  const { data } = await db
    .from("payment_bookings")
    .select("*")
    .eq("whatsapp", whatsapp)
    .eq("total_amount_inr", amountInr)
    .eq("status", "Pending")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  return data ?? null;
}

// Manual "Payment Link" bridge bookings (logged from the admin panel for a
// link you create yourself in the Razorpay app, since an Individual account
// has no live API key to create one in code) are confirmed here instead of
// via handlePaymentCaptured, since they have no order_id. Everything
// downstream (status, refund button, revenue stats, emails) is identical
// once this fires.
async function handlePaymentLinkPaid(
  db: SupabaseClient,
  linkEntity: Record<string, unknown> | undefined,
  paymentEntity: Record<string, unknown> | undefined,
) {
  const linkId = linkEntity?.id as string | undefined;
  const paymentId = paymentEntity?.id as string | undefined;

  let booking = linkId ? await findBookingByPaymentLinkId(db, linkId) : null;
  if (!booking) {
    const customer = linkEntity?.customer as Record<string, unknown> | undefined;
    booking = await findPendingBookingByContactAndAmount(
      db,
      customer?.contact as string | undefined,
      linkEntity?.amount as number | undefined,
    );
  }
  if (!booking) return;
  if (booking.status === "Paid") return;

  const { data: updated } = await db
    .from("payment_bookings")
    .update({
      status: "Paid",
      razorpay_payment_id: paymentId ?? booking.razorpay_payment_id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", booking.id)
    .select("*")
    .single();

  const finalBooking = updated ?? booking;
  const calendlyLink = await getCalendlyLink(db, finalBooking.pricing_id);

  await Promise.all([
    sendPaymentConfirmationEmail({
      toEmail: finalBooking.email ?? "",
      fullName: finalBooking.full_name,
      bookingId: finalBooking.id,
      serviceTitle: finalBooking.pricing_title_snapshot,
      totalAmountInr: finalBooking.total_amount_inr,
      calendlyLink,
    }),
    sendPaymentAlertEmail({
      fullName: finalBooking.full_name,
      whatsapp: finalBooking.whatsapp,
      serviceTitle: finalBooking.pricing_title_snapshot,
      totalAmountInr: finalBooking.total_amount_inr,
      bookingId: finalBooking.id,
    }),
    trackPurchase(finalBooking),
  ]);
}

async function handlePaymentFailed(
  db: SupabaseClient,
  entity: Record<string, unknown> | undefined,
) {
  const orderId = entity?.order_id as string | undefined;
  if (!orderId) return;

  const booking = await findBookingByOrderId(db, orderId);
  if (!booking) return;
  if (booking.status !== "Pending") return; // don't clobber Paid/Refunded/Abandoned

  await db
    .from("payment_bookings")
    .update({ status: "Failed", updated_at: new Date().toISOString() })
    .eq("id", booking.id);
}

async function handleRefundProcessed(
  db: SupabaseClient,
  entity: Record<string, unknown> | undefined,
) {
  const paymentId = entity?.payment_id as string | undefined;
  const refundId = entity?.id as string | undefined;
  const amount = entity?.amount as number | undefined;
  if (!paymentId) return;

  const { data: booking } = await db
    .from("payment_bookings")
    .select("*")
    .eq("razorpay_payment_id", paymentId)
    .maybeSingle();

  if (!booking) return;
  if (booking.status === "Refunded") return;

  await db
    .from("payment_bookings")
    .update({
      status: "Refunded",
      razorpay_refund_id: refundId ?? booking.razorpay_refund_id,
      refund_amount_inr: typeof amount === "number" ? paiseToRupees(amount) : booking.refund_amount_inr,
      updated_at: new Date().toISOString(),
    })
    .eq("id", booking.id);
}
