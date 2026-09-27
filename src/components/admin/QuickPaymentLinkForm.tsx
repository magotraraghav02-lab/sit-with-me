"use client";

import { useState } from "react";
import { createManualPaymentLink } from "@/app/payment-actions";

// Bridge tool for while the on-site checkout can't yet take live payments:
// creates a Razorpay Payment Link for one customer and hands you a
// one-tap "Send on WhatsApp" button, so you're not typing the message or
// generating the link by hand in the Razorpay dashboard. Once the customer
// pays, it shows up in the table below automatically -- same as any other
// booking, refundable the same way.
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
    shortUrl: string;
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

  function whatsappMessage() {
    if (!result) return "";
    return [
      `Hi ${result.customerName}! Here's your payment link for ${result.serviceTitle} (₹${result.amountInr.toLocaleString("en-IN")}):`,
      result.shortUrl,
      "",
      "Once it's paid, your booking is confirmed right away.",
      "- Team SIT WITH ME",
    ].join("\n");
  }

  function openWhatsapp() {
    if (!result) return;
    const url = `https://wa.me/91${result.whatsapp}?text=${encodeURIComponent(whatsappMessage())}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  async function copyLink() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.shortUrl);
    } catch {
      // clipboard API can be unavailable -- link is still visible to select manually
    }
  }

  return (
    <div className="card mb-6 p-4">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between text-left"
      >
        <span className="text-sm font-semibold text-ink">
          Quick Payment Link — send a customer a payment link on WhatsApp
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
                  {submitting ? "Creating link..." : "Create payment link"}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-forest">
                Payment link created for {result.customerName} — ₹
                {result.amountInr.toLocaleString("en-IN")}
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <code className="rounded-lg bg-sand px-3 py-2 text-sm text-ink">{result.shortUrl}</code>
                <button onClick={copyLink} className="btn-secondary !py-2 !px-3 text-sm">
                  Copy link
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                <button onClick={openWhatsapp} className="btn-primary !py-2 !px-4 text-sm">
                  Open WhatsApp to send it
                </button>
                <button onClick={reset} className="text-sm text-muted underline">
                  Create another
                </button>
              </div>
              <p className="text-xs text-muted">
                This opens WhatsApp with the message ready — you just hit send. Once the customer
                pays, this booking turns Paid automatically in the table below.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
