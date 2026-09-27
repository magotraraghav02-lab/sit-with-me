"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { PricingPlan, Zone } from "@/lib/types";
import CheckoutModal from "./CheckoutModal";

// Purely cosmetic grouping so similar plans share an accent color and a short
// category label — makes a longer list of plans easy to scan at a glance.
// Falls back to a neutral "forest" tag for any plan title that doesn't match.
function categoryFor(title: string): { label: string; dot: string; ring: string } {
  const t = title.toLowerCase();
  if (t.includes("run")) {
    return { label: "Active", dot: "bg-amber", ring: "ring-amber/30" };
  }
  if (t.includes("gym") || t.includes("workout")) {
    return { label: "Active", dot: "bg-amber", ring: "ring-amber/30" };
  }
  if (t.includes("talk") || t.includes("call")) {
    return { label: "Just talk", dot: "bg-navy", ring: "ring-navy/25" };
  }
  if (t.includes("café") || t.includes("cafe") || t.includes("coffee")) {
    return { label: "Coffee", dot: "bg-clay", ring: "ring-clay/30" };
  }
  return { label: "Outing", dot: "bg-forest", ring: "ring-forest/25" };
}

export default function Pricing({ plans, zones }: { plans: PricingPlan[]; zones: Zone[] }) {
  const reduceMotion = useReducedMotion();
  const [checkoutPlan, setCheckoutPlan] = useState<PricingPlan | null>(null);

  return (
    <section id="pricing" className="bg-cream">
      <div className="section">
        <h2 className="mb-3 text-center text-3xl font-semibold text-ink">Pricing</h2>
        <p className="mx-auto mb-10 max-w-md text-center text-sm text-muted">
          Pick what sounds good — a call, a coffee, a walk, a run, or a workout. Same simple
          promise every time: real company, no judgment.
        </p>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan, i) => {
            const cat = categoryFor(plan.title);
            return (
              <motion.div
                key={plan.id}
                initial={reduceMotion ? undefined : { opacity: 0, y: 28 }}
                whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                className={`card relative overflow-visible p-6 ring-1 ${cat.ring} transition-transform duration-200 hover:-translate-y-1 hover:shadow-md active:scale-[0.99]`}
              >
                {i === 0 && (
                  <span className="badge-shimmer absolute right-4 top-4 overflow-hidden rounded-full bg-forest px-3 py-1 text-xs font-semibold text-white">
                    Most tried
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 rounded-full bg-black/[0.03] px-2.5 py-1 text-xs font-medium text-ink/70">
                  <span className={`h-1.5 w-1.5 rounded-full ${cat.dot}`} aria-hidden="true" />
                  {cat.label}
                </span>
                <h3 className="mt-3 text-lg font-semibold text-ink">{plan.title}</h3>
                <p className="mt-1 text-sm text-muted">{plan.duration}</p>
                <p className="mt-3 text-3xl font-semibold text-forest">
                  ₹{plan.price_inr.toLocaleString("en-IN")}
                </p>
                {plan.description && (
                  <p className="mt-3 text-sm text-ink/70">{plan.description}</p>
                )}
                <button
                  onClick={() => setCheckoutPlan(plan)}
                  className="btn-primary mt-5 w-full"
                >
                  Book now
                </button>
              </motion.div>
            );
          })}
        </div>
        <p className="mt-6 text-center text-sm text-muted">
          You cover your own food, tickets and travel. Full payment upfront via UPI, cards,
          netbanking or wallets confirms your booking.
        </p>
      </div>
      {checkoutPlan && (
        <CheckoutModal
          plan={checkoutPlan}
          zones={zones}
          onClose={() => setCheckoutPlan(null)}
        />
      )}
    </section>
  );
}
