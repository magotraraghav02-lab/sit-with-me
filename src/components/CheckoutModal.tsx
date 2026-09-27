"use client";

import { useEffect, useRef, useState } from "react";
import { isValidIndianMobile, normalizeIndianMobile } from "@/lib/validation";
import {
  getCheckoutQuote,
  createCheckoutOrder,
  verifyCheckoutPayment,
} from "@/app/payment-actions";
import type { PricingPlan, Zone } from "@/lib/types";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, handler: (response: unknown) => void) => void;
    };
  }
}

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "919310891615";

type Step = "form" | "submitting" | "success" | "failed";

type Quote = {
  baseAmountInr: number;
  travelFeeInr: number;
  couponDiscountInr: number;
  totalAmountInr: number;
  couponMessage: string | null;
};

type FormErrors = Partial<
  Record<"fullName" | "whatsapp" | "email" | "area" | "consent", string>
>;

export default function CheckoutModal({
  plan,
  zones,
  onClose,
}: {
  plan: PricingPlan;
  zones: Zone[];
  onClose: () => void;
}) {
  const [step, setStep] = useState<Step>("form");
  const [fullName, setFullName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [area, setArea] = useState(zones[0]?.area_name ?? "");
  const [notes, setNotes] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [isAdult, setIsAdult] = useState(false);
  const [agreedPolicy, setAgreedPolicy] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [quote, setQuote] = useState<Quote | null>(null);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [failMessage, setFailMessage] = useState("");
  const [successBooking, setSuccessBooking] = useState<{
    bookingId: string;
    totalAmountInr: number;
  } | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const result = await getCheckoutQuote({
        pricingId: plan.id,
        area: area || zones[0]?.area_name || "Indiranagar",
        couponCode: couponCode.trim() || null,
      });
      if (result.ok) {
        setQuote(result);
        setQuoteError(null);
      } else {
        setQuote(null);
        setQuoteError(result.message);
      }
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan.id, area, couponCode]);

  function validate(): FormErrors {
    const next: FormErrors = {};
    if (!fullName || fullName.trim().length < 2) next.fullName = "Please enter your full name.";
    if (!isValidIndianMobile(whatsapp)) next.whatsapp = "Enter a valid 10-digit Indian mobile number.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = "Enter a valid email address.";
    if (!area) next.area = "Please select your area.";
    if (!isAdult || !agreedPolicy) next.consent = "Both checkboxes are required.";
    return next;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;
    if (!quote) return;

    setFormError(null);
    setStep("submitting");

    const order = await createCheckoutOrder({
      pricingId: plan.id,
      fullName,
      whatsapp,
      email,
      area,
      notes,
      couponCode: couponCode.trim() || null,
      isAdult,
      agreedPolicy,
    });

    if (!order.ok) {
      setFormError(order.message);
      setStep("form");
      return;
    }

    if (!window.Razorpay) {
      setFormError("Payment gateway is still loading. Please try again in a moment.");
      setStep("form");
      return;
    }

    const rzp = new window.Razorpay({
      key: order.keyId,
      amount: order.amountInPaise,
      currency: order.currency,
      name: "SitWithMe",
      description: plan.title,
      order_id: order.orderId,
      prefill: order.prefill,
      theme: { color: "#E8A33D" },
      handler: async (response: unknown) => {
        const r = response as {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        };
        const verified = await verifyCheckoutPayment({
          bookingId: order.bookingId,
          orderId: r.razorpay_order_id,
          paymentId: r.razorpay_payment_id,
          signature: r.razorpay_signature,
        });
        if (verified.ok) {
          setSuccessBooking({
            bookingId: verified.booking.id,
            totalAmountInr: verified.booking.total_amount_inr,
          });
          setStep("success");
        } else {
          setFailMessage(verified.message);
          setStep("failed");
        }
      },
      modal: {
        ondismiss: () => {
          setFailMessage("Payment was cancelled. Your booking is still saved as pending.");
          setStep("failed");
        },
      },
    });

    rzp.on("payment.failed", () => {
      setFailMessage("Payment failed. You can try again with a different method.");
      setStep("failed");
    });

    rzp.open();
    setStep("form");
  }

  const whatsappMessage = successBooking
    ? encodeURIComponent(
        `Hi! I just paid for ${plan.title}. My Booking ID is ${successBooking.bookingId}.`,
      )
    : "";

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/50 p-0 sm:items-center sm:p-5"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget && step !== "submitting") onClose();
      }}
    >
      <div className="card max-h-[92vh] w-full max-w-md overflow-y-auto p-6 sm:p-8">
        {step === "success" && successBooking ? (
          <div className="text-center">
            <p className="text-lg font-medium text-forest">
              Payment received ✅
              <br />
              Booking ID: {successBooking.bookingId.slice(0, 8).toUpperCase()}
            </p>
            <p className="mt-2 text-sm text-muted">
              Amount paid: ₹{successBooking.totalAmountInr.toLocaleString("en-IN")}
            </p>
            <div className="mt-6 space-y-3">
              {plan.calendly_link ? (
                <a
                  href={plan.calendly_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary block w-full"
                >
                  Pick your slot
                </a>
              ) : (
                <p className="text-sm text-muted">We&apos;ll WhatsApp you shortly to pick a slot.</p>
              )}
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary block w-full"
              >
                Message us on WhatsApp
              </a>
              <button onClick={onClose} className="text-sm text-muted underline">
                Close
              </button>
            </div>
          </div>
        ) : step === "failed" ? (
          <div className="text-center">
            <p className="text-lg font-medium text-ink">Payment not completed</p>
            <p className="mt-2 text-sm text-muted">{failMessage}</p>
            <div className="mt-6 space-y-3">
              <button onClick={() => setStep("form")} className="btn-primary w-full">
                Try again
              </button>
              <button onClick={onClose} className="text-sm text-muted underline">
                Close
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-ink">Book: {plan.title}</h3>
                <p className="text-sm text-muted">{plan.duration}</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="text-2xl leading-none text-muted hover:text-ink"
              >
                &times;
              </button>
            </div>

            <div>
              <label className="label" htmlFor="co-fullName">
                Full name
              </label>
              <input
                id="co-fullName"
                className="input"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your name"
              />
              {errors.fullName && <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>}
            </div>

            <div>
              <label className="label" htmlFor="co-whatsapp">
                WhatsApp number
              </label>
              <input
                id="co-whatsapp"
                className="input"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="10-digit mobile number"
                inputMode="numeric"
              />
              {errors.whatsapp && <p className="mt-1 text-sm text-red-600">{errors.whatsapp}</p>}
            </div>

            <div>
              <label className="label" htmlFor="co-email">
                Email
              </label>
              <input
                id="co-email"
                type="email"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>

            <div>
              <label className="label" htmlFor="co-area">
                Area
              </label>
              <select
                id="co-area"
                className="input"
                value={area}
                onChange={(e) => setArea(e.target.value)}
              >
                {zones.map((z) => (
                  <option key={z.id} value={z.area_name}>
                    {z.area_name}
                    {!z.in_zone && z.travel_fee_inr > 0 ? ` (+₹${z.travel_fee_inr} travel)` : ""}
                  </option>
                ))}
              </select>
              {errors.area && <p className="mt-1 text-sm text-red-600">{errors.area}</p>}
            </div>

            <div>
              <label className="label" htmlFor="co-notes">
                Preferred date/time or notes (optional)
              </label>
              <textarea
                id="co-notes"
                className="input min-h-[70px]"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div>
              <label className="label" htmlFor="co-coupon">
                Coupon code (optional)
              </label>
              <input
                id="co-coupon"
                className="input"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="e.g. WELCOME100"
              />
            </div>

            <div className="rounded-xl bg-sand p-4 text-sm text-ink">
              {quoteError ? (
                <p className="text-red-600">{quoteError}</p>
              ) : quote ? (
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>{plan.title}</span>
                    <span>₹{quote.baseAmountInr.toLocaleString("en-IN")}</span>
                  </div>
                  {quote.travelFeeInr > 0 && (
                    <div className="flex justify-between">
                      <span>Travel fee (out of zone)</span>
                      <span>₹{quote.travelFeeInr.toLocaleString("en-IN")}</span>
                    </div>
                  )}
                  {quote.couponDiscountInr > 0 && (
                    <div className="flex justify-between text-forest">
                      <span>Coupon discount</span>
                      <span>-₹{quote.couponDiscountInr.toLocaleString("en-IN")}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-black/10 pt-1 font-semibold">
                    <span>Total</span>
                    <span>₹{quote.totalAmountInr.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              ) : (
                <p className="text-muted">Calculating price...</p>
              )}
            </div>

            <div className="space-y-3 pt-1">
              <label className="flex items-start gap-2 text-sm text-ink/80">
                <input
                  type="checkbox"
                  checked={isAdult}
                  onChange={(e) => setIsAdult(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-black/20"
                />
                I am 18 or older
              </label>
              <label className="flex items-start gap-2 text-sm text-ink/80">
                <input
                  type="checkbox"
                  checked={agreedPolicy}
                  onChange={(e) => setAgreedPolicy(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-black/20"
                />
                I understand this is platonic companionship, not therapy, and I agree to the{" "}
                <a href="/refund-policy" target="_blank" className="underline">
                  Refund &amp; Cancellation Policy
                </a>
              </label>
              {errors.consent && <p className="text-sm text-red-600">{errors.consent}</p>}
            </div>

            {formError && <p className="text-sm text-red-600">{formError}</p>}

            <button
              type="submit"
              disabled={step === "submitting" || !quote}
              className="btn-primary w-full"
            >
              {step === "submitting" ? "Opening secure checkout..." : "Pay & confirm booking"}
            </button>
            <p className="text-center text-xs text-muted">🔒 Secure payments by Razorpay</p>
          </form>
        )}
      </div>
    </div>
  );
}
