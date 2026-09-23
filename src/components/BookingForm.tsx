"use client";

import { useEffect, useRef, useState } from "react";
import { submitBooking } from "@/app/actions";
import { validateBookingInput, type BookingFormErrors } from "@/lib/validation";
import { ACTIVITIES, type Companion } from "@/lib/types";

export default function BookingForm({ companions }: { companions: Companion[] }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [companionId, setCompanionId] = useState("");
  const [fullName, setFullName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [activity, setActivity] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  const [area, setArea] = useState("");
  const [notes, setNotes] = useState("");
  const [isAdult, setIsAdult] = useState(false);
  const [agreesToContact, setAgreesToContact] = useState(false);
  const [errors, setErrors] = useState<BookingFormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<"idle" | "success" | "error">("idle");
  const [resultMessage, setResultMessage] = useState("");
  const [renderedAt, setRenderedAt] = useState<number>(0);

  useEffect(() => {
    setRenderedAt(Date.now());
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = (e.target as HTMLElement).closest(".book-with-link") as HTMLElement | null;
      if (!target) return;
      e.preventDefault();
      const id = target.dataset.companionId;
      if (id) setCompanionId(id);
      document.getElementById("booking")?.scrollIntoView({ behavior: "smooth" });
    }
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  const selectedCompanionName =
    companions.find((c) => c.id === companionId)?.first_name ?? "Anyone";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const validationErrors = validateBookingInput({
      fullName,
      whatsapp,
      activity,
      preferredDate,
      preferredTime,
      area,
      isAdult,
      agreesToContact,
    });
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSubmitting(true);
    setResult("idle");

    const formData = new FormData(formRef.current!);
    const outcome = await submitBooking(formData);
    setSubmitting(false);

    if (outcome.ok) {
      setResult("success");
      setFullName("");
      setWhatsapp("");
      setCompanionId("");
      setActivity("");
      setPreferredDate("");
      setPreferredTime("");
      setArea("");
      setNotes("");
      setIsAdult(false);
      setAgreesToContact(false);
      setErrors({});
    } else {
      setResult("error");
      setResultMessage(outcome.message);
    }
  }

  return (
    <section id="booking" className="bg-cream scroll-mt-6">
      <div className="section">
        <h2 className="mb-2 text-center text-3xl font-semibold text-ink">Book a meetup</h2>
        <p className="mb-8 text-center text-muted">We'll WhatsApp you within 2 hours.</p>

        {result === "success" ? (
          <div className="card mx-auto max-w-md p-8 text-center">
            <p className="text-lg font-medium text-forest">
              Thanks! We'll WhatsApp you within 2 hours.
            </p>
          </div>
        ) : (
          <form
            ref={formRef}
            onSubmit={handleSubmit}
            className="card mx-auto max-w-md space-y-4 p-6 sm:p-8"
          >
            {/* Honeypot - hidden from real users */}
            <input
              type="text"
              name="company_website"
              tabIndex={-1}
              autoComplete="off"
              className="absolute left-[-9999px] h-0 w-0 opacity-0"
              aria-hidden="true"
            />
            <input type="hidden" name="form_rendered_at" value={renderedAt} />
            <input type="hidden" name="companionName" value={selectedCompanionName} />

            <div>
              <label className="label" htmlFor="fullName">
                Full name
              </label>
              <input
                id="fullName"
                name="fullName"
                className="input"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your name"
              />
              {errors.fullName && <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>}
            </div>

            <div>
              <label className="label" htmlFor="whatsapp">
                WhatsApp number
              </label>
              <input
                id="whatsapp"
                name="whatsapp"
                className="input"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="10-digit mobile number"
                inputMode="numeric"
              />
              {errors.whatsapp && <p className="mt-1 text-sm text-red-600">{errors.whatsapp}</p>}
            </div>

            <div>
              <label className="label" htmlFor="companionId">
                Preferred companion
              </label>
              <select
                id="companionId"
                name="companionId"
                className="input"
                value={companionId}
                onChange={(e) => setCompanionId(e.target.value)}
              >
                <option value="">Anyone</option>
                {companions.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.first_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label" htmlFor="activity">
                Activity
              </label>
              <select
                id="activity"
                name="activity"
                className="input"
                value={activity}
                onChange={(e) => setActivity(e.target.value)}
              >
                <option value="">Choose an activity</option>
                {ACTIVITIES.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
              {errors.activity && <p className="mt-1 text-sm text-red-600">{errors.activity}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label" htmlFor="preferredDate">
                  Date
                </label>
                <input
                  id="preferredDate"
                  name="preferredDate"
                  type="date"
                  className="input"
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                />
                {errors.preferredDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.preferredDate}</p>
                )}
              </div>
              <div>
                <label className="label" htmlFor="preferredTime">
                  Time
                </label>
                <input
                  id="preferredTime"
                  name="preferredTime"
                  type="time"
                  className="input"
                  value={preferredTime}
                  onChange={(e) => setPreferredTime(e.target.value)}
                />
                {errors.preferredTime && (
                  <p className="mt-1 text-sm text-red-600">{errors.preferredTime}</p>
                )}
              </div>
            </div>

            <div>
              <label className="label" htmlFor="area">
                Area in Bangalore
              </label>
              <input
                id="area"
                name="area"
                className="input"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="e.g. Indiranagar"
              />
              {errors.area && <p className="mt-1 text-sm text-red-600">{errors.area}</p>}
            </div>

            <div>
              <label className="label" htmlFor="notes">
                Anything you'd like us to know? (optional)
              </label>
              <textarea
                id="notes"
                name="notes"
                className="input min-h-[80px]"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div className="space-y-3 pt-1">
              <label className="flex items-start gap-2 text-sm text-ink/80">
                <input
                  type="checkbox"
                  name="isAdult"
                  checked={isAdult}
                  onChange={(e) => setIsAdult(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-black/20"
                />
                I am 18 or older
              </label>
              <label className="flex items-start gap-2 text-sm text-ink/80">
                <input
                  type="checkbox"
                  name="agreesToContact"
                  checked={agreesToContact}
                  onChange={(e) => setAgreesToContact(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-black/20"
                />
                I agree to be contacted on WhatsApp and understand this is platonic companionship,
                not therapy
              </label>
              {errors.consent && <p className="text-sm text-red-600">{errors.consent}</p>}
            </div>

            {result === "error" && <p className="text-sm text-red-600">{resultMessage}</p>}

            <button type="submit" disabled={submitting} className="btn-primary w-full">
              {submitting ? "Sending..." : "Send booking request"}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
