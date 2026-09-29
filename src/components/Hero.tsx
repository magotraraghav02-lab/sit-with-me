"use client";

import { motion, useReducedMotion } from "framer-motion";

const FLOATERS = [
  { emoji: "☕", top: "10%", left: "8%", delay: "0s", size: "text-3xl" },
  { emoji: "🌳", top: "70%", left: "10%", delay: "1.2s", size: "text-4xl" },
  { emoji: "🎬", top: "16%", left: "86%", delay: "2.4s", size: "text-3xl" },
  { emoji: "🛕", top: "74%", left: "88%", delay: "0.6s", size: "text-3xl" },
  { emoji: "🏃", top: "44%", left: "50%", delay: "1.8s", size: "text-2xl" },
];

const ORBS = [
  { size: 220, top: "-8%", left: "-6%", color: "rgba(232,163,61,0.20)" },
  { size: 260, top: "60%", left: "78%", color: "rgba(74,93,80,0.18)" },
  { size: 160, top: "20%", left: "62%", color: "rgba(201,143,101,0.20)" },
];

const HEADLINE_LINE_1 = ["Someone", "to", "talk", "to."];
const HEADLINE_LINE_2 = ["No", "judgment."];

export default function Hero() {
  const reduceMotion = useReducedMotion();

  return (
    <section id="top" className="relative overflow-hidden bg-sand">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {ORBS.map((o, i) => (
          <span
            key={i}
            className="orb-drift absolute rounded-full blur-3xl"
            style={{
              width: o.size,
              height: o.size,
              top: o.top,
              left: o.left,
              background: o.color,
              animationDelay: `${i * 2.5}s`,
            }}
          />
        ))}
        {FLOATERS.map((f, i) => (
          <span
            key={i}
            className="float-emoji absolute select-none"
            style={{ top: f.top, left: f.left, animationDelay: f.delay }}
          >
            <span className={f.size}>{f.emoji}</span>
          </span>
        ))}
      </div>
      <div className="relative mx-auto max-w-3xl px-5 pb-16 pt-20 text-center sm:pt-28">
        <p className="mb-4 text-sm font-medium uppercase tracking-wide text-clay">
          Bangalore · Platonic companionship
        </p>
        <h1 className="text-navy text-4xl font-semibold leading-tight sm:text-5xl">
          <span className="block">
            {HEADLINE_LINE_1.map((word, i) => (
              <motion.span
                key={word}
                className="mr-[0.28em] inline-block"
                initial={reduceMotion ? undefined : { opacity: 0, y: 14 }}
                animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              >
                {word}
              </motion.span>
            ))}
          </span>
          <span
            className={
              reduceMotion ? "block" : "hero-shimmer block bg-clip-text text-transparent"
            }
          >
            {HEADLINE_LINE_2.map((word, i) => (
              <motion.span
                key={word}
                className="mr-[0.28em] inline-block"
                initial={reduceMotion ? undefined : { opacity: 0, y: 14 }}
                animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                transition={{
                  duration: 0.45,
                  delay: (HEADLINE_LINE_1.length + i) * 0.08,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                {word}
              </motion.span>
            ))}
          </span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg text-muted">
          Coffee, walks, movies, temple visits, runs, gym sessions — real company in Bangalore,
          for whatever you&apos;re up for.
        </p>
        <a href="#pricing" className="btn-primary btn-glow mt-8">
          See pricing &amp; book
        </a>
      </div>
    </section>
  );
}
