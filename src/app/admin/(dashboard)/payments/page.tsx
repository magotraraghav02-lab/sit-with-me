"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toCsv, downloadCsv } from "@/lib/csv";
import { PAYMENT_STATUSES, type PaymentBooking } from "@/lib/types";
import PaymentRow, { needsFollowUp } from "@/components/admin/PaymentRow";
import QuickPaymentLinkForm from "@/components/admin/QuickPaymentLinkForm";
import { markAbandonedBookings } from "@/app/payment-actions";

export default function AdminPaymentsPage() {
  const [bookings, setBookings] = useState<PaymentBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [serviceFilter, setServiceFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [followUpOnly, setFollowUpOnly] = useState(false);

  useEffect(() => {
    async function load() {
      await markAbandonedBookings();
      const supabase = createClient();
      const { data } = await supabase
        .from("payment_bookings")
        .select("*")
        .order("created_at", { ascending: false });
      setBookings((data as PaymentBooking[]) ?? []);
      setLoading(false);
    }
    load();
  }, []);

  const serviceOptions = useMemo(() => {
    const set = new Set(bookings.map((b) => b.pricing_title_snapshot));
    return [...set];
  }, [bookings]);

  const filtered = bookings.filter((b) => {
    if (statusFilter && b.status !== statusFilter) return false;
    if (serviceFilter && b.pricing_title_snapshot !== serviceFilter) return false;
    if (dateFilter && !b.created_at.startsWith(dateFilter)) return false;
    if (followUpOnly && !needsFollowUp(b)) return false;
    return true;
  });

  const stats = useMemo(() => {
    const paidOnly = bookings.filter((b) => b.status === "Paid");

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfToday.getDate() - startOfToday.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    function sumSince(cutoff: Date) {
      return paidOnly
        .filter((b) => new Date(b.created_at) >= cutoff)
        .reduce((sum, b) => sum + b.total_amount_inr, 0);
    }

    const revenueByService = new Map<string, number>();
    paidOnly.forEach((b) => {
      revenueByService.set(
        b.pricing_title_snapshot,
        (revenueByService.get(b.pricing_title_snapshot) ?? 0) + b.total_amount_inr,
      );
    });

    return {
      revenueToday: sumSince(startOfToday),
      revenueWeek: sumSince(startOfWeek),
      revenueMonth: sumSince(startOfMonth),
      paidCount: paidOnly.length,
      revenueByService: [...revenueByService.entries()].sort((a, b) => b[1] - a[1]),
    };
  }, [bookings]);

  function handleRowChange(updated: PaymentBooking) {
    setBookings((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
  }

  function handleExport() {
    const rows = filtered.map((b) => ({
      booking_id: b.id,
      created_at: b.created_at,
      full_name: b.full_name,
      whatsapp: b.whatsapp,
      email: b.email,
      service: b.pricing_title_snapshot,
      base_amount_inr: b.base_amount_inr,
      travel_fee_inr: b.travel_fee_inr,
      coupon_code: b.coupon_code,
      coupon_discount_inr: b.coupon_discount_inr,
      total_amount_inr: b.total_amount_inr,
      status: b.status,
      utm_source: b.utm_source,
      utm_medium: b.utm_medium,
      utm_campaign: b.utm_campaign,
      fbclid: b.fbclid,
      razorpay_payment_id: b.razorpay_payment_id,
      razorpay_order_id: b.razorpay_order_id,
    }));
    downloadCsv(`payments-${new Date().toISOString().slice(0, 10)}.csv`, toCsv(rows));
  }

  return (
    <div>
      <QuickPaymentLinkForm />

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Revenue today" value={`₹${stats.revenueToday.toLocaleString("en-IN")}`} />
        <StatCard label="Revenue this week" value={`₹${stats.revenueWeek.toLocaleString("en-IN")}`} />
        <StatCard label="Revenue this month" value={`₹${stats.revenueMonth.toLocaleString("en-IN")}`} />
        <StatCard label="Paid bookings" value={stats.paidCount} />
      </div>

      {stats.revenueByService.length > 0 && (
        <div className="card mb-6 p-4">
          <p className="mb-2 text-xs uppercase tracking-wide text-muted">Revenue by service</p>
          <div className="space-y-1 text-sm">
            {stats.revenueByService.map(([title, amount]) => (
              <div key={title} className="flex justify-between">
                <span className="text-ink">{title}</span>
                <span className="font-medium text-ink">₹{amount.toLocaleString("en-IN")}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm"
        >
          <option value="">All statuses</option>
          {PAYMENT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          value={serviceFilter}
          onChange={(e) => setServiceFilter(e.target.value)}
          className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm"
        >
          <option value="">All services</option>
          {serviceOptions.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm"
        />
        <label className="flex items-center gap-1.5 text-sm text-ink">
          <input
            type="checkbox"
            checked={followUpOnly}
            onChange={(e) => setFollowUpOnly(e.target.checked)}
            className="h-4 w-4 rounded border-black/20"
          />
          Needs follow-up (30+ min, unpaid)
        </label>
        {(statusFilter || serviceFilter || dateFilter || followUpOnly) && (
          <button
            onClick={() => {
              setStatusFilter("");
              setServiceFilter("");
              setDateFilter("");
              setFollowUpOnly(false);
            }}
            className="text-sm text-muted hover:text-ink"
          >
            Clear filters
          </button>
        )}
        <button onClick={handleExport} className="btn-secondary ml-auto !py-2 !px-4 text-sm">
          Export to CSV
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl2 bg-white shadow-sm ring-1 ring-black/5">
        <table className="w-full text-left">
          <thead className="bg-sand/60 text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-3 py-3">Created</th>
              <th className="px-3 py-3">Name</th>
              <th className="px-3 py-3">WhatsApp</th>
              <th className="px-3 py-3">Service</th>
              <th className="px-3 py-3">Amount</th>
              <th className="px-3 py-3">Travel fee</th>
              <th className="px-3 py-3">Coupon</th>
              <th className="px-3 py-3">Source / Campaign</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-3 py-3">Payment ID</th>
              <th className="px-3 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={11} className="px-3 py-6 text-center text-muted">
                  Loading...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={11} className="px-3 py-6 text-center text-muted">
                  No payments yet.
                </td>
              </tr>
            ) : (
              filtered.map((b) => <PaymentRow key={b.id} booking={b} onChange={handleRowChange} />)
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="card p-4">
      <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-ink">{value}</p>
    </div>
  );
}
