import type { PricingPlan } from "@/lib/types";

export default function Pricing({ plans }: { plans: PricingPlan[] }) {
  return (
    <section className="bg-cream">
      <div className="section">
        <h2 className="mb-10 text-center text-3xl font-semibold text-ink">Pricing</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {plans.map((plan) => (
            <div key={plan.id} className="card p-6">
              <h3 className="text-lg font-semibold text-ink">{plan.title}</h3>
              <p className="mt-1 text-sm text-muted">{plan.duration}</p>
              <p className="mt-3 text-3xl font-semibold text-forest">
                ₹{plan.price_inr.toLocaleString("en-IN")}
              </p>
              {plan.description && (
                <p className="mt-3 text-sm text-ink/70">{plan.description}</p>
              )}
            </div>
          ))}
        </div>
        <p className="mt-6 text-center text-sm text-muted">
          You cover your own food, tickets and travel. Full payment upfront via UPI confirms your
          booking.
        </p>
      </div>
    </section>
  );
}
