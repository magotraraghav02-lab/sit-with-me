"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion, animate } from "framer-motion";

// Every number here comes straight from the database (count of Paid bookings,
// fetched server-side in page.tsx) -- never invented, never a fake "people
// viewing this" style counter. Hidden entirely below 20 so a small number
// never reads as unimpressive or, worse, fabricated-looking.
export default function StatsStrip({ totalPaidSessions }: { totalPaidSessions: number }) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [display, setDisplay] = useState(reduceMotion ? totalPaidSessions : 0);

  useEffect(() => {
    if (!inView || reduceMotion) return;
    const controls = animate(0, totalPaidSessions, {
      duration: 1.4,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, reduceMotion, totalPaidSessions]);

  if (totalPaidSessions < 20) return null;

  return (
    <section className="bg-sand">
      <div className="mx-auto max-w-3xl px-5 py-8 text-center">
        <motion.p
          initial={reduceMotion ? undefined : { opacity: 0, y: 12 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-sm text-muted"
        >
          <span ref={ref} className="text-3xl font-semibold text-forest">
            {display.toLocaleString("en-IN")}
          </span>{" "}
          real meetups booked so far
        </motion.p>
      </div>
    </section>
  );
}
