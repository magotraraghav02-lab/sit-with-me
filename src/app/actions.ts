"use server";

import { createServiceRoleClient } from "@/lib/supabase/server";
import { validateBookingInput, normalizeIndianMobile } from "@/lib/validation";
import { sendBookingAlertEmail } from "@/lib/email";

export type SubmitBookingResult = { ok: true } | { ok: false; message: string };

const RATE_LIMIT_WINDOW_MINUTES = 15;
const RATE_LIMIT_MAX_PER_NUMBER = 3;
const MIN_FILL_TIME_MS = 2500;

export async function submitBooking(formData: FormData): Promise<SubmitBookingResult> {
  // Honeypot: real visitors never fill this hidden field.
  const honeypot = String(formData.get("company_website") ?? "").trim();
  if (honeypot.length > 0) {
    return { ok: true };
  }

  // Time-trap: bots submit near-instantly after the page loads.
  const renderedAt = Number(formData.get("form_rendered_at") ?? 0);
  if (!renderedAt || Date.now() - renderedAt < MIN_FILL_TIME_MS) {
    return { ok: true };
  }

  const fullName = String(formData.get("fullName") ?? "").trim();
  const whatsappRaw = String(formData.get("whatsapp") ?? "").trim();
  const companionId = String(formData.get("companionId") ?? "") || null;
  const companionName = String(formData.get("companionName") ?? "").trim() || "Anyone";
  const activity = String(formData.get("activity") ?? "");
  const preferredDate = String(formData.get("preferredDate") ?? "");
  const preferredTime = String(formData.get("preferredTime") ?? "");
  const area = String(formData.get("area") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();
  const isAdult = formData.get("isAdult") === "on";
  const agreesToContact = formData.get("agreesToContact") === "on";

  const errors = validateBookingInput({
    fullName,
    whatsapp: whatsappRaw,
    activity,
    preferredDate,
    preferredTime,
    area,
    isAdult,
    agreesToContact,
  });

  if (Object.keys(errors).length > 0) {
    return { ok: false, message: "Please check the highlighted fields and try again." };
  }

  const whatsapp = normalizeIndianMobile(whatsappRaw);
  const supabase = createServiceRoleClient();

  const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MINUTES * 60_000).toISOString();
  const { count } = await supabase
    .from("bookings")
    .select("id", { count: "exact", head: true })
    .eq("whatsapp", whatsapp)
    .gte("created_at", windowStart);

  if ((count ?? 0) >= RATE_LIMIT_MAX_PER_NUMBER) {
    return {
      ok: false,
      message: "You've already sent a few requests recently. WhatsApp us directly and we'll help right away.",
    };
  }

  const { error } = await supabase.from("bookings").insert({
    full_name: fullName,
    whatsapp,
    companion_id: companionId,
    companion_name_snapshot: companionName,
    activity,
    preferred_date: preferredDate,
    preferred_time: preferredTime,
    area,
    notes: notes || null,
    status: "New",
  });

  if (error) {
    return { ok: false, message: "Something went wrong on our end. Please try again or WhatsApp us." };
  }

  await sendBookingAlertEmail({
    fullName,
    whatsapp,
    companion: companionName,
    activity,
    preferredDate,
    preferredTime,
    area,
  });

  return { ok: true };
}
