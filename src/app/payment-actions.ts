"use server";

import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { isValidIndianMobile, normalizeIndianMobile } from "@/lib/validation";
import { paymentProvider, rupeesToPaise, paiseToRupees, PAYMENT_CURRENCY } from "@/lib/payments";
import {
  sendPaymentConfirmationEmail,
  sendPaymentAlertEmail,
  sendBookingRequestAlertEmail,
  sendBookingRequestReceivedEmail,
  sendAbandonedReminderEmail,
} from "@/lib/email";
import { sendBookingRequestAlertWhatsApp } from "@/lib/whatsapp";
import { sendBookingRequestAlertTelegram } from "@/lib/telegram";
import type { PaymentBooking, PricingPlan, Zone, Coupon } from "@/lib/types";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type QuoteInput = {
  pricingId: string;
  area: string;
  couponCode: string | null;
};

export type QuoteResult =
  | {
      ok: true;
      serviceTitle: string;
      baseAmountInr: number;
      travelFeeInr: number;
      couponDiscountInr: number;
      totalAmountInr: number;
      couponApplied: boolean;
      couponMessage: string | null;
    }
  | { ok: false; message: string };

async function computeQuote(input: QuoteInput): Promise<
  | {
      ok: true;
      pricing: PricingPlan;
      zone: Zone | null;
      coupon: Coupon | null;
      baseAmountInr: number;
      travelFeeInr: number;
      couponDiscountInr: number;
      totalAmountInr: number;
      couponMessage: string | null;
    }
  | { ok: false; message: string }
> {
  const db = createServiceRoleClient();

  const { data: pricing } = await db
    .from("pricing")
    .select("*")
    .eq("id", input.pricingId)
    .eq("visible", true)
    .maybeSingle();

  if (!pricing) {
    return { ok: false, message: "That service is no longer available. Please refresh and try again." };
  }

  const { data: zone } = await db
    .from("zones")
    .select("*")
    .ilike("area_name", input.area.trim())
    .maybeSingle();

  const travelFeeInr = zone && !zone.in_zone ? zone.travel_fee_inr : 0;

  let couponDiscountInr = 0;
  let coupon: Coupon | null = null;
  let couponMessage: string | null = null;
  const code = input.couponCode?.trim().toUpperCase();
  if (code) {
    const { data: couponRow } = await db
      .from("coupons")
      .select("*")
      .eq("code", code)
      .eq("active", true)
      .maybeSingle();
    if (!couponRow) {
      return { ok: false, message: "That coupon code isn't valid." };
    }
    coupon = couponRow;
    couponDiscountInr = couponRow.discount_inr;
    couponMessage = `Coupon ${couponRow.code} applied: -₹${couponRow.discount_inr}`;
  }

  const baseAmountInr = pricing.price_inr;
  const rawTotal = baseAmountInr + travelFeeInr - couponDiscountInr;
  const totalAmountInr = Math.max(1, Math.round(rawTotal));

  return {
    ok: true,
    pricing,
    zone: zone ?? null,
    coupon,
    baseAmountInr,
    travelFeeInr,
    couponDiscountInr,
    totalAmountInr,
    couponMessage,
  };
}

export async function getCheckoutQuote(input: QuoteInput): Promise<QuoteResult> {
  const quote = await computeQuote(input);
  if (!quote.ok) return quote;
  return {
    ok: true,
    serviceTitle: quote.pricing.title,
    baseAmountInr: quote.baseAmountInr,
    travelFeeInr: quote.travelFeeInr,
    couponDiscountInr: quote.couponDiscountInr,
    totalAmountInr: quote.totalAmountInr,
    couponApplied: quote.couponDiscountInr > 0,
    couponMessage: quote.couponMessage,
  };
}

export type SubmitBookingRequestInput = {
  pricingId: string;
  fullName: string;
  whatsapp: string;
  email: string;
  area: string;
  notes: string;
  companionName: string | null;
  couponCode: string | null;
  isAdult: boolean;
  agreedPolicy: boolean;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  utmTerm?: string | null;
  utmContent?: string | null;
  fbclid?: string | null;
  fbp?: string | null;
  fbc?: string | null;
  landingPage?: string | null;
};

export type SubmitBookingRequestResult =
  | {
      ok: true;
      bookingId: string;
      whatsapp: string;
      fullName: string;
      serviceTitle: string;
      totalAmountInr: number;
    }
  | { ok: false; message: string };

// Customer-facing "submit a booking request" flow. This intentionally never
// talks to Razorpay: our Individual Razorpay account can't get a live API key
// without full business KYC documents we don't have, so there's no way to open
// an in-browser payment popup that could ever take real money. Instead we save
// a Pending booking (same shape/table as every other booking) and alert the
// admin on every channel at once so they can reply fast, then send the
// customer a real, working Razorpay Payment Link by hand -- see
// createManualPaymentLink below, and the payment_link.paid webhook handler
// that flips this booking to Paid automatically once they pay.
export async function submitBookingRequest(
  input: SubmitBookingRequestInput,
): Promise<SubmitBookingRequestResult> {
  if (!input.fullName || input.fullName.trim().length < 2) {
    return { ok: false, message: "Please enter your full name." };
  }
  if (!isValidIndianMobile(input.whatsapp)) {
    return { ok: false, message: "Enter a valid 10-digit Indian mobile number." };
  }
  if (input.email && !EMAIL_RE.test(input.email)) {
    return { ok: false, message: "Enter a valid email address, or leave it blank." };
  }
  if (!input.area || input.area.trim().length < 2) {
    return { ok: false, message: "Please select your area." };
  }
  if (!input.isAdult || !input.agreedPolicy) {
    return { ok: false, message: "Both checkboxes are required." };
  }

  const quote = await computeQuote({
    pricingId: input.pricingId,
    area: input.area,
    couponCode: input.couponCode,
  });
  if (!quote.ok) return quote;

  const whatsapp = normalizeIndianMobile(input.whatsapp);
  const email = input.email?.trim() || null;
  const companionName = input.companionName?.trim() || null;
  const combinedNotes =
    [
      companionName ? `Requested companion: ${companionName}` : null,
      input.notes?.trim() || null,
    ]
      .filter(Boolean)
      .join(" | ") || null;

  const db = createServiceRoleClient();

  const { data: booking, error: insertError } = await db
    .from("payment_bookings")
    .insert({
      full_name: input.fullName.trim(),
      whatsapp,
      email,
      pricing_id: quote.pricing.id,
      pricing_title_snapshot: quote.pricing.title,
      base_amount_inr: quote.baseAmountInr,
      area: input.area.trim(),
      travel_fee_inr: quote.travelFeeInr,
      coupon_code: quote.coupon?.code ?? null,
      coupon_discount_inr: quote.couponDiscountInr,
      total_amount_inr: quote.totalAmountInr,
      currency: PAYMENT_CURRENCY,
      notes: combinedNotes,
      is_adult: input.isAdult,
      agreed_policy: input.agreedPolicy,
      status: "Pending",
      utm_source: input.utmSource || null,
      utm_medium: input.utmMedium || null,
      utm_campaign: input.utmCampaign || null,
      utm_term: input.utmTerm || null,
      utm_content: input.utmContent || null,
      fbclid: input.fbclid || null,
      fbp: input.fbp || null,
      fbc: input.fbc || null,
      landing_page: input.landingPage || null,
    })
    .select("*")
    .single();

  if (insertError || !booking) {
    return { ok: false, message: "Couldn't save your request. Please try again." };
  }

  const alertPayload = {
    fullName: booking.full_name,
    whatsapp: booking.whatsapp,
    serviceTitle: booking.pricing_title_snapshot,
    totalAmountInr: booking.total_amount_inr,
    area: booking.area,
    companionName,
  };

  await Promise.all([
    sendBookingRequestAlertEmail({ ...alertPayload, bookingId: booking.id, notes: booking.notes }),
    sendBookingRequestAlertWhatsApp(alertPayload),
    sendBookingRequestAlertTelegram(alertPayload),
    sendBookingRequestReceivedEmail({
      toEmail: booking.email,
      fullName: booking.full_name,
      bookingId: booking.id,
      serviceTitle: booking.pricing_title_snapshot,
      totalAmountInr: booking.total_amount_inr,
    }),
  ]);

  return {
    ok: true,
    bookingId: booking.id,
    whatsapp,
    fullName: booking.full_name,
    serviceTitle: booking.pricing_title_snapshot,
    totalAmountInr: booking.total_amount_inr,
  };
}

async function requireAdmin(): Promise<{ ok: true } | { ok: false; message: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Not signed in." };

  const { data: adminRow } = await supabase
    .from("admin_users")
    .select("email")
    .eq("email", user.email)
    .maybeSingle();
  if (!adminRow) return { ok: false, message: "Not authorized." };

  return { ok: true };
}

export type RefundInput = {
  bookingId: string;
  amountInr?: number;
};

export type RefundResult =
  | { ok: true; booking: PaymentBooking }
  | { ok: false; message: string };

export async function refundPayment(input: RefundInput): Promise<RefundResult> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth;

  const db = createServiceRoleClient();
  const { data: booking } = await db
    .from("payment_bookings")
    .select("*")
    .eq("id", input.bookingId)
    .maybeSingle();

  if (!booking) return { ok: false, message: "Booking not found." };
  if (booking.status !== "Paid") {
    return { ok: false, message: "Only a Paid booking can be refunded." };
  }
  if (!booking.razorpay_payment_id) {
    return { ok: false, message: "No payment id on this booking." };
  }

  const amountInPaise =
    typeof input.amountInr === "number" ? rupeesToPaise(input.amountInr) : undefined;

  try {
    const refund = await paymentProvider.refund({
      paymentId: booking.razorpay_payment_id,
      amountInPaise,
      notes: { booking_id: booking.id },
    });

    const { data: updated } = await db
      .from("payment_bookings")
      .update({
        status: "Refunded",
        razorpay_refund_id: refund.refundId,
        refund_amount_inr: paiseToRupees(refund.amountInPaise),
        updated_at: new Date().toISOString(),
      })
      .eq("id", booking.id)
      .select("*")
      .single();

    return { ok: true, booking: updated ?? { ...booking, status: "Refunded" } };
  } catch {
    return { ok: false, message: "Refund failed. Please try again or check Razorpay dashboard." };
  }
}

export type CreateManualLinkInput = {
  fullName: string;
  whatsapp: string;
  email: string;
  serviceTitle: string;
  amountInr: number;
  notes: string;
};

export type CreateManualLinkResult =
  | {
      ok: true;
      bookingId: string;
      whatsapp: string;
      customerName: string;
      serviceTitle: string;
      amountInr: number;
    }
  | { ok: false; message: string };

// Admin-only bridge: logs a Pending booking for a payment link YOU create
// yourself in the Razorpay app/dashboard (your Individual account can't get
// a live API key without full business KYC, so we can't generate the link
// in code). Use the exact same phone number and amount here as you enter in
// Razorpay -- that's how the webhook matches this booking to that payment
// once the customer pays, and flips it to Paid automatically (same refund
// button, same revenue stats, same confirmation email as any other booking).
export async function createManualPaymentLink(
  input: CreateManualLinkInput,
): Promise<CreateManualLinkResult> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth;

  if (!input.fullName || input.fullName.trim().length < 2) {
    return { ok: false, message: "Enter the customer's name." };
  }
  if (!isValidIndianMobile(input.whatsapp)) {
    return { ok: false, message: "Enter a valid 10-digit Indian mobile number." };
  }
  if (input.email && !EMAIL_RE.test(input.email)) {
    return { ok: false, message: "That email address doesn't look right." };
  }
  if (!input.serviceTitle || input.serviceTitle.trim().length < 2) {
    return { ok: false, message: "Enter what this payment is for." };
  }
  const amountInr = Math.round(Number(input.amountInr));
  if (!Number.isFinite(amountInr) || amountInr < 1) {
    return { ok: false, message: "Enter a valid amount." };
  }

  const whatsapp = normalizeIndianMobile(input.whatsapp);
  const email = input.email?.trim() || null;
  const db = createServiceRoleClient();

  const { data: booking, error: insertError } = await db
    .from("payment_bookings")
    .insert({
      full_name: input.fullName.trim(),
      whatsapp,
      email,
      pricing_id: null,
      pricing_title_snapshot: input.serviceTitle.trim(),
      base_amount_inr: amountInr,
      area: "-",
      travel_fee_inr: 0,
      coupon_code: null,
      coupon_discount_inr: 0,
      total_amount_inr: amountInr,
      currency: PAYMENT_CURRENCY,
      notes: input.notes?.trim() || null,
      is_adult: true,
      agreed_policy: true,
      status: "Pending",
    })
    .select("*")
    .single();

  if (insertError || !booking) {
    return { ok: false, message: "Couldn't save this booking. Please try again." };
  }

  return {
    ok: true,
    bookingId: booking.id,
    whatsapp,
    customerName: input.fullName.trim(),
    serviceTitle: input.serviceTitle.trim(),
    amountInr,
  };
}

// A "Pending" booking now waits on you to send a manual Razorpay Payment Link
// and on the customer to pay it -- that can reasonably take hours, so this
// only sweeps up requests nobody ever followed up on. Keep this window long:
// a booking marked Abandoned too early would also stop matching the
// payment_link.paid webhook (it only matches still-Pending bookings), so a
// real late payment could come in and have nothing to attach to.
const ABANDON_AFTER_MS = 3 * 24 * 60 * 60 * 1000; // 3 days

export async function markAbandonedBookings(): Promise<{ ok: true; count: number }> {
  const db = createServiceRoleClient();
  const cutoff = new Date(Date.now() - ABANDON_AFTER_MS).toISOString();
  const { data } = await db
    .from("payment_bookings")
    .update({ status: "Abandoned", updated_at: new Date().toISOString() })
    .eq("status", "Pending")
    .lt("created_at", cutoff)
    .select("id");

  return { ok: true, count: data?.length ?? 0 };
}

const REMINDER_AFTER_MS = 30 * 60 * 1000; // 30 minutes

// One-time "still there?" email for a still-Pending booking, ~30 minutes in.
// Meant to be called by /api/cron/sweep-bookings every few minutes (see that
// route + the README for why Vercel's own Hobby-tier cron can't hit that
// frequency on its own).
export async function sendAbandonedReminders(): Promise<{ ok: true; count: number }> {
  const db = createServiceRoleClient();
  const cutoff = new Date(Date.now() - REMINDER_AFTER_MS).toISOString();

  const { data: candidates } = await db
    .from("payment_bookings")
    .select("*")
    .eq("status", "Pending")
    .is("abandoned_reminder_sent_at", null)
    .not("email", "is", null)
    .lt("created_at", cutoff);

  if (!candidates || candidates.length === 0) return { ok: true, count: 0 };

  let sent = 0;
  for (const booking of candidates as PaymentBooking[]) {
    if (!booking.email) continue;
    await sendAbandonedReminderEmail({
      toEmail: booking.email,
      fullName: booking.full_name,
      bookingId: booking.id,
      serviceTitle: booking.pricing_title_snapshot,
      totalAmountInr: booking.total_amount_inr,
    });
    await db
      .from("payment_bookings")
      .update({ abandoned_reminder_sent_at: new Date().toISOString() })
      .eq("id", booking.id);
    sent += 1;
  }

  return { ok: true, count: sent };
}
