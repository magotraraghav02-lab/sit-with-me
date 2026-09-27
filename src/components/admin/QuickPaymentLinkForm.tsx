"use client";

import { useState } from "react";
import { createManualPaymentLink } from "@/app/payment-actions";

// Bridge tool for an Individual Razorpay account: it can't get a live API
// key (needs full business KYC), so this doesn't create the payment link --
// you still create that yourself in the Razorpay app/dashboard, exactly as
// you do today. What this DOES do: log the booking here first, so that once
// you create the matching link (same phone number, same amount) and the
// customer pays, the payment_link.paid webhook matches it back to this row
// automatically -- same "Paid" status, same refund button, same revenue
// stats, same confirmation email as any other booking on the site.
export default function QuickPaymentLinkForm() {
  const [open, setOpen] = useState(false);
  const [fullName, setFullName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [serviceTitle, setServiceTitle] = useState("");
  const [amountInr, setAmountInr] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    whatsapp: string;
    customerName: string;
    serviceTitle: string;
    amountInr: number;
  } | null>(null);

  function reset() {
    setFullName("");
    setWhatsapp("");
    setEmail("");
    setServiceTitle("");
    setAmountInr("");
    setNotes("");
    setResult(null);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const res = await createManualPaymentLink({
      fullName,
      whatsapp,
      email,
      serviceTitle,
      amountInr: Number(amountInr),
      notes,
    });
    setSubmitting(false);
    if (res.ok) {
      setResult(res);
    } else {
      setError(res.message);
    }
  }

  return (
    <div className="card mb-6 p-4">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between text-left"
      >
        <span className="text-sm font-semibold text-ink">
          Track a Payment Link — for links you create yourself in Razorpay
        </span>
        <span className="text-sm text-forest">{open ? "Hide" : "Open"}</span>
      </button>

      {open && (
        <div className="mt-4 border-t border-black/10 pt-4">
          {!result ? (
            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="label">Customer name</label>
                <input
                  className="input"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="label">WhatsApp number</label>
                <input
                  className="input"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="10-digit number"
                  required
                />
              </div>
              <div>
                <label className="label">Email (optional)</label>
                <input
                  className="input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="For the payment receipt"
                />
              </div>
              <div>
                <label className="label">Amount (₹)</label>
                <input
                  className="input"
                  type="number"
                  min={1}
                  value={amountInr}
                  onChange={(e) => setAmountInr(e.target.value)}
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <label className="label">What&apos;s this for</label>
                <input
                  className="input"
                  value={serviceTitle}
                  onChange={(e) => setServiceTitle(e.target.value)}
                  placeholder="e.g. Café chat, 1 hour"
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <label className="label">Internal notes (optional)</label>
                <input className="input" value={notes} onChange={(e) => setNotes(e.target.value)} />
              </div>
              {error && <p className="text-sm text-red-600 sm:col-span-2">{error}</p>}
              <div className="sm:col-span-2">
                <button type="submit" disabled={submitting} className="btn-primary !py-2 !px-4 text-sm">
                  {submitting ? "Saving..." : "Save booking"}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-forest">
                Booking saved for {result.customerName} — ₹{result.amountInr.toLocaleString("en-IN")}
              </p>
              <div className="rounded-lg bg-sand p-3 text-sm text-ink">
                <p className="mb-2 font-medium">Now finish it in Razorpay:</p>
                <ol className="list-inside list-decimal space-y-1">
                  <li>
                    Open the Razorpay app (or dashboard) → <strong>Payment Links</strong> → new link
                  </li>
                  <li>
                    Amount: <strong>₹{result.amountInr.toLocaleString("en-IN")}</strong> (must match
                    exactly)
                  </li>
                  <li>
                    Customer phone: <strong>{result.whatsapp}</strong> (must match exactly)
                  </li>
                  <li>Create it, then send it to the customer yourself — WhatsApp, SMS, however you like</li>
                </ol>
                <p className="mt-2 text-xs text-muted">
                  Once they pay, this booking flips to &quot;Paid&quot; below on its own — no need to
                  come back and update anything.
                </p>
              </div>
              <button onClick={reset} className="text-sm text-muted underline">
                Log another booking
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
