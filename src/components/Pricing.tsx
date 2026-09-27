"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { PricingPlan, Zone } from "@/lib/types";
import CheckoutModal from "./CheckoutModal";

export default function Pricing({ plans, zones }: { plans: PricingPlan[]; zones: Zone[] }) {
  const reduceMotion = useReducedMotion();
  const [checkoutPlan, setCheckoutPlan] = useState<PricingPlan | null>(null);

  return (
    <section className="bg-cream">
      <div className="section">
        <h2 className="mb-10 text-center text-3xl font-semibold text-ink">Pricing</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={reduceMotion ? undefined : { opacity: 0, y: 28 }}
              whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
              className="card relative overflow-visible p-6 transition-transform duration-200 hover:-translate-y-1 hover:shadow-md active:scale-[0.99]"
            >
              {i === 0 && (
                <span className="badge-shimmer absolute right-4 top-4 overflow-hidden rounded-full bg-forest px-3 py-1 text-xs font-semibold text-white">
                  Most tried
                </span>
              )}
              <h3 className="text-lg font-semibold text-ink">{plan.title}</h3>
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
          ))}
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
