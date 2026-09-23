import type { Companion } from "@/lib/types";
import CompanionCard from "./CompanionCard";

export default function CompanionsSection({ companions }: { companions: Companion[] }) {
  return (
    <section className="bg-cream">
      <div className="section">
        <h2 className="mb-2 text-center text-3xl font-semibold text-ink">Meet your companions</h2>
        <p className="mb-10 text-center text-muted">
          Real listeners, not experts or therapists — just good company.
        </p>
        {companions.length === 0 ? (
          <p className="text-center text-muted">Companions will be listed here shortly.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {companions.map((companion) => (
              <CompanionCard key={companion.id} companion={companion} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
