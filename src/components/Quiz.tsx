"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { PricingPlan, Zone } from "@/lib/types";
import CheckoutModal from "./CheckoutModal";

type Question = {
  key: string;
  prompt: string;
  options: { label: string; emoji: string; tag: string }[];
};

const QUESTIONS: Question[] = [
  {
    key: "want",
    prompt: "I want to…",
    options: [
      { label: "Talk", emoji: "\u{1F4AC}", tag: "talk" },
      { label: "Move", emoji: "\u{1F3C3}", tag: "move" },
      { label: "Explore", emoji: "\u{1F3D9}️", tag: "explore" },
      { label: "Get company for something", emoji: "\u{1F91D}", tag: "company" },
    ],
  },
  {
    key: "how",
    prompt: "How?",
    options: [
      { label: "Call", emoji: "\u{1F4DE}", tag: "call" },
      { label: "In person", emoji: "\u{1F9CD}", tag: "in-person" },
    ],
  },
  {
    key: "when",
    prompt: "When?",
    options: [
      { label: "Today", emoji: "⚡", tag: "today" },
      { label: "This week", emoji: "\u{1F4C5}", tag: "week" },
    ],
  },
];

function pickBestPlan(plans: PricingPlan[], tags: string[]): PricingPlan | null {
  let best: PricingPlan | null = null;
  let bestScore = 0;
  for (const plan of plans) {
    const score = plan.quiz_tags.filter((t) => tags.includes(t)).length;
    if (score > bestScore) {
      best = plan;
      bestScore = score;
    }
  }
  return bestScore > 0 ? best : null;
}

export default function Quiz({ plans, zones }: { plans: PricingPlan[]; zones: Zone[] }) {
  const reduceMotion = useReducedMotion();
  const [dismissed, setDismissed] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [checkoutPlan, setCheckoutPlan] = useState<PricingPlan | null>(null);

  if (dismissed) return null;

  const isResult = step >= QUESTIONS.length;
  const recommended = isResult ? pickBestPlan(plans, answers) : null;

  function choose(tag: string) {
    setAnswers((prev) => [...prev, tag]);
    setStep((s) => s + 1);
  }

  function reset() {
    setAnswers([]);
    setStep(0);
  }

  const slideVariants = reduceMotion
    ? {}
    : {
        initial: { opacity: 0, x: 24 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -24 },
      };

  return (
    <section className="bg-sand">
      <div className="section !py-10">
        <div className="card relative mx-auto max-w-md overflow-hidden p-6 sm:p-8">
          <button
            onClick={() => setDismissed(true)}
            aria-label="Skip the quiz"
            className="absolute right-4 top-4 text-sm text-muted hover:text-ink"
          >
            Skip ✕
          </button>

          <p className="mb-1 text-center text-xs font-medium uppercase tracking-wide text-clay">
            30-second finder
          </p>
          <h3 className="mb-5 text-center text-xl font-semibold text-ink">
            What do you need today?
          </h3>

          <AnimatePresence mode="wait">
            {!isResult ? (
              <motion.div
                key={step}
                {...slideVariants}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              >
                <p className="mb-4 text-center text-base font-medium text-ink">
                  {QUESTIONS[step].prompt}
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {QUESTIONS[step].options.map((opt) => (
                    <button
                      key={opt.tag}
                      onClick={() => choose(opt.tag)}
                      className="flex flex-col items-center gap-1.5 rounded-xl border border-black/10 bg-white px-3 py-4 text-sm font-medium text-ink transition hover:-translate-y-0.5 hover:border-forest/40 hover:shadow-md active:scale-95"
                    >
                      <span className="text-2xl">{opt.emoji}</span>
                      {opt.label}
                    </button>
                  ))}
                </div>
                <div className="mt-5 flex justify-center gap-1.5">
                  {QUESTIONS.map((_, i) => (
                    <span
                      key={i}
                      className={`h-1.5 w-6 rounded-full transition-colors ${
                        i <= step ? "bg-forest" : "bg-black/10"
                      }`}
                    />
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="result"
                {...slideVariants}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="text-center"
              >
                {recommended ? (
                  <>
                    <p className="mb-1 text-sm text-muted">We&apos;d suggest</p>
                    <h4 className="mb-1 text-2xl font-semibold text-forest">
                      {recommended.title}
                    </h4>
                    <p className="mb-4 text-sm text-muted">
                      {recommended.duration} · ₹{recommended.price_inr.toLocaleString("en-IN")}
                    </p>
                    <button
                      onClick={() => setCheckoutPlan(recommended)}
                      className="btn-primary w-full"
                    >
                      Book now
                    </button>
                  </>
                ) : (
                  <>
                    <p className="mb-4 text-sm text-muted">
                      We&apos;ve got a few options that could work — take a look below.
                    </p>
                    <a
                      href="#pricing"
                      onClick={(e) => {
                        e.preventDefault();
                        document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="btn-primary block w-full"
                    >
                      See pricing
                    </a>
                  </>
                )}
                <button onClick={reset} className="mt-3 text-sm text-muted underline">
                  Start over
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      {checkoutPlan && (
        <CheckoutModal plan={checkoutPlan} zones={zones} onClose={() => setCheckoutPlan(null)} />
      )}
    </section>
  );
}
