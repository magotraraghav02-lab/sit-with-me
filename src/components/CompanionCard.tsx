import Image from "next/image";
import type { Companion } from "@/lib/types";

export default function CompanionCard({ companion }: { companion: Companion }) {
  return (
    <div className="card flex flex-col overflow-hidden">
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
    </div>
  );
}
