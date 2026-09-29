"use client";

import { motion, useReducedMotion } from "framer-motion";

const COLORS = ["#E8A33D", "#4A5D50", "#C98F65", "#2A3A6B", "#C9607F"];
const PIECES = Array.from({ length: 28 }, (_, i) => ({
  id: i,
  left: Math.random() * 100,
  delay: Math.random() * 0.3,
  rotate: Math.random() * 360,
  color: COLORS[i % COLORS.length],
  drift: (Math.random() - 0.5) * 80,
}));

// Pure CSS/framer confetti -- no extra dependency, tiny DOM footprint, and it
// fully no-ops under prefers-reduced-motion instead of just skipping the
// animation (a static field of dots would look like a rendering bug).
export default function ConfettiBurst() {
  const reduceMotion = useReducedMotion();
  if (reduceMotion) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[80] overflow-hidden" aria-hidden="true">
      {PIECES.map((p) => (
        <motion.span
          key={p.id}
          className="absolute top-[-10px] block h-2.5 w-2.5 rounded-sm"
          style={{ left: `${p.left}%`, backgroundColor: p.color }}
          initial={{ y: -20, x: 0, opacity: 1, rotate: 0 }}
          animate={{
            y: "110vh",
            x: p.drift,
            opacity: [1, 1, 0],
            rotate: p.rotate,
          }}
          transition={{ duration: 2.4, delay: p.delay, ease: "easeIn" }}
        />
      ))}
    </div>
  );
}
