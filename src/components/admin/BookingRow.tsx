"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { BOOKING_STATUSES, type Booking, type BookingStatus } from "@/lib/types";

export default function BookingRow({
  booking,
  onChange,
}: {
  booking: Booking;
  onChange: (updated: Booking) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [internalNotes, setInternalNotes] = useState(booking.internal_notes ?? "");
  const [amountPaid, setAmountPaid] = useState(booking.amount_paid?.toString() ?? "");
  const [wouldRebook, setWouldRebook] = useState(booking.would_rebook ?? "");
  const [saving, setSaving] = useState(false);

  const supabase = createClient();

  async function updateStatus(status: BookingStatus) {
    const { data, error } = await supabase
      .from("bookings")
      .update({ status })
      .eq("id", booking.id)
      .select()
      .single();
    if (!error && data) onChange(data as Booking);
  }

  async function saveDetails() {
    setSaving(true);
    const { data, error } = await supabase
      .from("bookings")
      .update({
        internal_notes: internalNotes || null,
        amount_paid: amountPaid ? Number(amountPaid) : null,
        would_rebook: wouldRebook || null,
      })
      .eq("id", booking.id)
      .select()
      .single();
    setSaving(false);
    if (!error && data) onChange(data as Booking);
  }

  const whatsappGreeting = encodeURIComponent(
    `Hi ${booking.full_name.split(" ")[0]}, this is SIT WITH ME! Thanks for your booking request for ${booking.activity} on ${booking.preferred_date}. Let's confirm the details.`,
  );

  return (
    <>
      <tr className="border-b border-black/5 align-top">
        <td className="whitespace-nowrap px-3 py-3 text-sm text-muted">
          {new Date(booking.created_at).toLocaleString("en-IN")}
        </td>
        <td className="px-3 py-3 text-sm font-medium text-ink">{booking.full_name}</td>
        <td className="whitespace-nowrap px-3 py-3 text-sm text-ink">{booking.whatsapp}</td>
        <td className="px-3 py-3 text-sm text-ink">{booking.companion_name_snapshot ?? "Anyone"}</td>
        <td className="px-3 py-3 text-sm text-ink">{booking.activity}</td>
        <td className="whitespace-nowrap px-3 py-3 text-sm text-ink">
          {booking.preferred_date} {booking.preferred_time}
        </td>
        <td className="px-3 py-3 text-sm text-ink">{booking.area}</td>
        <td className="max-w-[160px] truncate px-3 py-3 text-sm text-muted" title={booking.notes ?? ""}>
          {booking.notes ?? "—"}
        </td>
        <td className="px-3 py-3">
          <select
            value={booking.status}
            onChange={(e) => updateStatus(e.target.value as BookingStatus)}
            className="rounded-lg border border-black/10 bg-white px-2 py-1.5 text-sm"
          >
            {BOOKING_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </td>
        <td className="whitespace-nowrap px-3 py-3">
          <a
            href={`https://wa.me/91${booking.whatsapp}?text=${whatsappGreeting}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-[#128C7E] hover:underline"
          >
            Open WhatsApp
          </a>
        </td>
        <td className="px-3 py-3">
          <button
            onClick={() => setExpanded((v) => !v)}
            className="text-sm text-forest hover:underline"
          >
            {expanded ? "Hide" : "Details"}
          </button>
        </td>
      </tr>
      {expanded && (
        <tr className="border-b border-black/5 bg-white/60">
          <td colSpan={11} className="px-3 py-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="label">Internal notes</label>
                <textarea
                  className="input min-h-[70px]"
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                />
              </div>
              <div>
                <label className="label">Amount paid (₹)</label>
                <input
                  type="number"
                  className="input"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                />
              </div>
              <div>
                <label className="label">Would they rebook?</label>
                <select
                  className="input"
                  value={wouldRebook}
                  onChange={(e) => setWouldRebook(e.target.value)}
                >
                  <option value="">Unknown</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                  <option value="Maybe">Maybe</option>
                </select>
              </div>
            </div>
            <button onClick={saveDetails} disabled={saving} className="btn-secondary mt-3">
              {saving ? "Saving..." : "Save details"}
            </button>
          </td>
        </tr>
      )}
    </>
  );
}
