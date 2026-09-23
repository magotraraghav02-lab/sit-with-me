const DO = ["Listen", "Talk", "Keep you company", "Explore the city"];
const DONT = ["Romance", "Dating", "Physical contact", "Therapy or medical advice", "Home visits"];

export default function DoDont() {
  return (
    <section className="bg-sand">
      <div className="section">
        <h2 className="mb-10 text-center text-3xl font-semibold text-ink">
          What we do / don&apos;t do
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="card p-6">
            <h3 className="mb-3 font-semibold text-forest">We DO</h3>
            <ul className="space-y-2 text-sm text-ink/80">
              {DO.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-0.5 text-forest">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="card p-6">
            <h3 className="mb-3 font-semibold text-clay">We DON&apos;T</h3>
            <ul className="space-y-2 text-sm text-ink/80">
              {DONT.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-0.5 text-clay">✕</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
