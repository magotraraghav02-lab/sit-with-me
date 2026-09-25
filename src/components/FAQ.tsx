"use client";

import { useState } from "react";

const FAQS = [
  { q: "Is this dating?", a: "No, strictly platonic." },
  { q: "Are you therapists?", a: "No, we're good listeners, not professionals." },
  { q: "Where do we meet?", a: "Public places only." },
  { q: "Can I rebook the same companion?", a: "Yes." },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="bg-sand">
      <div className="section">
        <h2 className="mb-10 text-center text-3xl font-semibold text-ink">FAQ</h2>
        <div className="space-y-4">
          {FAQS.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <div key={item.q} className="card p-5">
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 text-left"
                  aria-expanded={isOpen}
                >
                  <h3 className="font-semibold text-ink">{item.q}</h3>
                  <span
                    className={`accordion-icon flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-forest/10 text-forest transition-transform duration-300 ${
                      isOpen ? "rotate-45" : ""
                    }`}
                    aria-hidden
                  >
                    +
                  </span>
                </button>
                <div
                  className="accordion-panel grid transition-[grid-template-rows] duration-300 ease-out"
                  style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                >
                  <div className="overflow-hidden">
                    <p className="pt-3 text-sm text-muted">{item.a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
