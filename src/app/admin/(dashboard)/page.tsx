"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toCsv, downloadCsv } from "@/lib/csv";
import { BOOKING_STATUSES, type Booking } from "@/lib/types";
import BookingRow from "@/components/admin/BookingRow";

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [dateFilter, setDateFilter] = useState<string>("");

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setBookings((data as Booking[]) ?? []);
        setLoading(false);
      });
  }, []);

  const filtered = useMemo(() => {
    return bookings.filter((b) => {
      if (statusFilter && b.status !== statusFilter) return false;
      if (dateFilter && b.preferred_date !== dateFilter) return false;
      return true;
    });
  }, [bookings, statusFilter, dateFilter]);

  const stats = useMemo(() => {
    const totalInquiries = bookings.length;
    const paidBookings = bookings.filter((b) => b.status === "Paid" || b.status === "Completed").length;
    const totalRevenue = bookings.reduce((sum, b) => sum + (b.amount_paid ?? 0), 0);

    const completedByNumber = new Map<string, number>();
    bookings
      .filter((b) => b.status === "Completed")
      .forEach((b) => completedByNumber.set(b.whatsapp, (completedByNumber.get(b.whatsapp) ?? 0) + 1));
    const repeatCustomers = [...completedByNumber.values()].filter((n) => n >= 2).length;

    return { totalInquiries, paidBookings, totalRevenue, repeatCustomers };
  }, [bookings]);

  function handleRowChange(updated: Booking) {
    setBookings((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
  }

  function handleExport() {
    const rows = filtered.map((b) => ({
      created_at: b.created_at,
      full_name: b.full_name,
      whatsapp: b.whatsapp,
      companion: b.companion_name_snapshot ?? "Anyone",
      activity: b.activity,
      preferred_date: b.preferred_date,
      preferred_time: b.preferred_time,
      area: b.area,
      notes: b.notes,
      status: b.status,
      internal_notes: b.internal_notes,
      amount_paid: b.amount_paid,
      would_rebook: b.would_rebook,
    }));
    downloadCsv(`bookings-${new Date().toISOString().slice(0, 10)}.csv`, toCsv(rows));
  }

  return (
    <div>
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total inquiries" value={stats.totalInquiries} />
        <StatCard label="Paid bookings" value={stats.paidBookings} />
        <StatCard label="Total revenue" value={`₹${stats.totalRevenue.toLocaleString("en-IN")}`} />
        <StatCard label="Repeat customers" value={stats.repeatCustomers} />
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm"
        >
          <option value="">All statuses</option>
          {BOOKING_STATUSES.map((s) => (
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
        {(statusFilter || dateFilter) && (
          <button
            onClick={() => {
              setStatusFilter("");
              setDateFilter("");
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
              <th className="px-3 py-3">Received</th>
              <th className="px-3 py-3">Name</th>
              <th className="px-3 py-3">WhatsApp</th>
              <th className="px-3 py-3">Companion</th>
              <th className="px-3 py-3">Activity</th>
              <th className="px-3 py-3">Date/Time</th>
              <th className="px-3 py-3">Area</th>
              <th className="px-3 py-3">Notes</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-3 py-3">WhatsApp</th>
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
                  No bookings yet.
                </td>
              </tr>
            ) : (
              filtered.map((b) => <BookingRow key={b.id} booking={b} onChange={handleRowChange} />)
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
