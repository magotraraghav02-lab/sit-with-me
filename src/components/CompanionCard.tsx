"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import type { Companion } from "@/lib/types";

export default function CompanionCard({
  companion,
  index = 0,
}: {
  companion: Companion;
  index?: number;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? undefined : { opacity: 0, scale: 0.92, y: 16 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="card flex flex-col overflow-hidden transition-transform duration-200 hover:-translate-y-1 hover:shadow-md active:scale-[0.99]"
    >
      <div className="relative aspect-[4/3] w-full bg-sand">
        {companion.photo_url ? (
          <Image
            src={companion.photo_url}
            alt={companion.first_name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 400px"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted">No photo yet</div>
        )}
        {companion.available_today && (
          <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-forest shadow-sm backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
            </span>
            Available today
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-1 flex items-baseline justify-between">
          <h3 className="text-lg font-semibold text-ink">{companion.first_name}</h3>
          <span className="text-sm text-muted">{companion.age} yrs</span>
        </div>
        <p className="mb-2 text-sm text-clay">{companion.languages.join(" · ")}</p>
        <p className="mb-3 text-sm text-ink/80">{companion.intro}</p>
        <p className="mb-5 text-sm text-muted">
          <span className="font-medium text-ink/70">Loves: </span>
          {companion.favorites}
        </p>
        <a
          href={`#booking?companion=${companion.id}`}
          data-companion-id={companion.id}
          data-companion-name={companion.first_name}
          className="book-with-link btn-secondary mt-auto"
        >
          Book with {companion.first_name}
        </a>
      </div>
    </motion.div>
  );
}
