const FAQS = [
  { q: "Is this dating?", a: "No, strictly platonic." },
  { q: "Are you therapists?", a: "No, we're good listeners, not professionals." },
  { q: "Where do we meet?", a: "Public places only." },
  { q: "Can I rebook the same companion?", a: "Yes." },
];

export default function FAQ() {
  return (
    <section className="bg-sand">
      <div className="section">
        <h2 className="mb-10 text-center text-3xl font-semibold text-ink">FAQ</h2>
        <div className="space-y-4">
          {FAQS.map((item) => (
            <div key={item.q} className="card p-5">
              <h3 className="mb-1 font-semibold text-ink">{item.q}</h3>
              <p className="text-sm text-muted">{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
