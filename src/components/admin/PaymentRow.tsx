"use client";

import { useState } from "react";
import { refundPayment } from "@/app/payment-actions";
import type { PaymentBooking } from "@/lib/types";

const STATUS_STYLES: Record<string, string> = {
  Pending: "bg-sand text-ink",
  Paid: "bg-forest/15 text-forest",
  Failed: "bg-red-100 text-red-700",
  Refunded: "bg-black/10 text-ink",
  Abandoned: "bg-amber/20 text-ink",
};

export default function PaymentRow({
  booking,
  onChange,
}: {
  booking: PaymentBooking;
  onChange: (updated: PaymentBooking) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [confirmingRefund, setConfirmingRefund] = useState(false);
  const [refundAmount, setRefundAmount] = useState(booking.total_amount_inr.toString());
  const [refunding, setRefunding] = useState(false);
  const [refundError, setRefundError] = useState<string | null>(null);

  async function handleRefund() {
    setRefunding(true);
    setRefundError(null);
    const amountInr = Number(refundAmount);
    const result = await refundPayment({
      bookingId: booking.id,
      amountInr: Number.isFinite(amountInr) && amountInr > 0 ? amountInr : undefined,
    });
    setRefunding(false);
    if (result.ok) {
      onChange(result.booking);
      setConfirmingRefund(false);
    } else {
      setRefundError(result.message);
    }
  }

  return (
    <>
      <tr className="border-b border-black/5 align-top">
        <td className="whitespace-nowrap px-3 py-3 text-sm text-muted">
          {new Date(booking.created_at).toLocaleString("en-IN")}
        </td>
        <td className="px-3 py-3 text-sm font-medium text-ink">{booking.full_name}</td>
        <td className="whitespace-nowrap px-3 py-3 text-sm text-ink">{booking.whatsapp}</td>
        <td className="px-3 py-3 text-sm text-ink">{booking.pricing_title_snapshot}</td>
        <td className="whitespace-nowrap px-3 py-3 text-sm text-ink">
          ₹{booking.total_amount_inr.toLocaleString("en-IN")}
        </td>
        <td className="whitespace-nowrap px-3 py-3 text-sm text-muted">
          {booking.travel_fee_inr > 0 ? `₹${booking.travel_fee_inr}` : "—"}
        </td>
        <td className="px-3 py-3 text-sm text-muted">{booking.coupon_code ?? "—"}</td>
        <td className="px-3 py-3">
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
              STATUS_STYLES[booking.status] ?? "bg-sand text-ink"
            }`}
          >
            {booking.status}
          </span>
        </td>
        <td className="max-w-[140px] truncate px-3 py-3 text-xs text-muted" title={booking.razorpay_payment_id ?? ""}>
          {booking.razorpay_payment_id ?? "—"}
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
          <td colSpan={9} className="px-3 py-4">
            <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted">Booking ID</p>
                <p className="text-ink">{booking.id}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted">Email</p>
                <p className="text-ink">{booking.email}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted">Area</p>
                <p className="text-ink">{booking.area}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted">Base amount</p>
                <p className="text-ink">₹{booking.base_amount_inr.toLocaleString("en-IN")}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted">Coupon discount</p>
                <p className="text-ink">₹{booking.coupon_discount_inr.toLocaleString("en-IN")}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted">Razorpay order ID</p>
                <p className="text-ink">{booking.razorpay_order_id ?? "—"}</p>
              </div>
              {booking.notes && (
                <div className="sm:col-span-3">
                  <p className="text-xs uppercase tracking-wide text-muted">Notes</p>
                  <p className="text-ink">{booking.notes}</p>
                </div>
              )}
              {booking.status === "Refunded" && (
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted">Refunded amount</p>
                  <p className="text-ink">₹{(booking.refund_amount_inr ?? 0).toLocaleString("en-IN")}</p>
                </div>
              )}
            </div>

            {booking.status === "Paid" && (
              <div className="mt-4 border-t border-black/10 pt-4">
                {!confirmingRefund ? (
                  <button
                    onClick={() => setConfirmingRefund(true)}
                    className="btn-secondary !py-2 !px-4 text-sm"
                  >
                    Refund
                  </button>
                ) : (
                  <div className="max-w-sm space-y-2">
                    <label className="label">Refund amount (₹) — full or partial</label>
                    <input
                      type="number"
                      className="input"
                      value={refundAmount}
                      onChange={(e) => setRefundAmount(e.target.value)}
                      max={booking.total_amount_inr}
                      min={1}
                    />
                    <p className="text-xs text-muted">
                      This will refund ₹{refundAmount || 0} to the customer via Razorpay. This
                      cannot be undone.
                    </p>
                    {refundError && <p className="text-sm text-red-600">{refundError}</p>}
                    <div className="flex gap-2">
                      <button
                        onClick={handleRefund}
                        disabled={refunding}
                        className="btn-primary !py-2 !px-4 text-sm"
                      >
                        {refunding ? "Refunding..." : "Confirm refund"}
                      </button>
                      <button
                        onClick={() => setConfirmingRefund(false)}
                        className="text-sm text-muted underline"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </td>
        </tr>
      )}
    </>
  );
}
