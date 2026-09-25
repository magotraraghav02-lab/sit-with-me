const FLOATERS = [
  { emoji: "☕", top: "10%", left: "8%", delay: "0s", size: "text-3xl" },
  { emoji: "🌳", top: "70%", left: "10%", delay: "1.2s", size: "text-4xl" },
  { emoji: "🎬", top: "16%", left: "86%", delay: "2.4s", size: "text-3xl" },
  { emoji: "🛕", top: "74%", left: "88%", delay: "0.6s", size: "text-3xl" },
  { emoji: "💬", top: "44%", left: "50%", delay: "1.8s", size: "text-2xl" },
];

export default function Hero() {
  return (
    <section id="top" className="relative overflow-hidden bg-sand">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {FLOATERS.map((f, i) => (
          <span
            key={i}
            className="float-emoji absolute select-none"
            style={{ top: f.top, left: f.left, animationDelay: f.delay }}
          >
            <span className={f.size}>{f.emoji}</span>
          </span>
        ))}
      </div>
      <div className="relative mx-auto max-w-3xl px-5 pb-16 pt-20 text-center sm:pt-28">
        <p className="mb-4 text-sm font-medium uppercase tracking-wide text-clay">
          Bangalore · Platonic companionship
        </p>
        <h1 className="shimmer-text text-4xl font-semibold leading-tight sm:text-5xl">
          Someone to talk to.
          <br />
          No judgment.
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg text-muted">
          Coffee, walks, movies, temple visits — real company in Bangalore.
        </p>
        <a href="#booking" className="btn-primary btn-glow mt-8">
          Book a meetup
        </a>
      </div>
    </section>
  );
}
