const STEPS = [
  { title: "Fill the form", desc: "Tell us who, when, where, and what you'd like to do." },
  { title: "We WhatsApp you", desc: "We confirm the details and answer any questions." },
  { title: "Pay by UPI and meet", desc: "Full payment upfront via UPI, then meet at a public place." },
];

export default function HowItWorks() {
  return (
    <section className="bg-sand">
      <div className="section">
        <h2 className="mb-10 text-center text-3xl font-semibold text-ink">How it works</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {STEPS.map((step, i) => (
            <div key={step.title} className="card p-6 text-center">
              <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-forest text-white">
                {i + 1}
              </div>
              <h3 className="mb-1 font-semibold text-ink">{step.title}</h3>
              <p className="text-sm text-muted">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
