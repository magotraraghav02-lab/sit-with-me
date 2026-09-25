"use client";

import { motion, useReducedMotion } from "framer-motion";

const STEPS = [
  { title: "Fill the form", desc: "Tell us who, when, where, and what you'd like to do." },
  { title: "We WhatsApp you", desc: "We confirm the details and answer any questions." },
  { title: "Pay by UPI and meet", desc: "Full payment upfront via UPI, then meet at a public place." },
];

export default function HowItWorks() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="bg-sand">
      <div className="section">
        <h2 className="mb-10 text-center text-3xl font-semibold text-ink">How it works</h2>
        <div className="relative grid grid-cols-1 gap-6 sm:grid-cols-3">
          <motion.div
            aria-hidden
            className="absolute left-[16.6%] right-[16.6%] top-[44px] hidden h-[2px] origin-left bg-forest/25 sm:block"
            initial={reduceMotion ? undefined : { scaleX: 0 }}
            whileInView={reduceMotion ? undefined : { scaleX: 1 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          />
          {STEPS.map((step, i) => (
            <div key={step.title} className="card relative z-10 p-6 text-center">
              <motion.div
                className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-forest text-white"
                initial={reduceMotion ? undefined : { opacity: 0, scale: 0.5 }}
                whileInView={reduceMotion ? undefined : { opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, delay: i * 0.2, ease: "backOut" }}
              >
                {i + 1}
              </motion.div>
              <h3 className="mb-1 font-semibold text-ink">{step.title}</h3>
              <p className="text-sm text-muted">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
