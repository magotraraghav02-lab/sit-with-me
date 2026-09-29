import type { Review } from "@/lib/types";

// Hidden entirely below 3 approved reviews -- a two-review "wall" would look
// sparse and less trustworthy than no section at all. Every review here is
// admin-entered and admin-approved; nothing here is generated or fabricated.
export default function Reviews({ reviews }: { reviews: Review[] }) {
  if (reviews.length < 3) return null;

  return (
    <section className="bg-cream">
      <div className="section">
        <h2 className="mb-10 text-center text-3xl font-semibold text-ink">What people say</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((r) => (
            <div key={r.id} className="card p-5">
              <span className="text-amber" aria-label={`${r.rating} out of 5 stars`}>
                {"★".repeat(r.rating)}
                {"☆".repeat(5 - r.rating)}
              </span>
              <p className="mt-2 text-sm text-ink/80">&ldquo;{r.review_text}&rdquo;</p>
              <p className="mt-3 text-sm font-medium text-ink">
                {r.customer_first_name} <span className="font-normal text-muted">· {r.service_title}</span>
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
