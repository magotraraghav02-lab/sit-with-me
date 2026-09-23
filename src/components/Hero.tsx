export default function Hero() {
  return (
    <section className="bg-sand">
      <div className="mx-auto max-w-3xl px-5 pb-16 pt-20 text-center sm:pt-28">
        <p className="mb-4 text-sm font-medium uppercase tracking-wide text-clay">
          Bangalore · Platonic companionship
        </p>
        <h1 className="text-4xl font-semibold leading-tight text-ink sm:text-5xl">
          Someone to talk to.
          <br />
          No judgment.
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg text-muted">
          Coffee, walks, movies, temple visits — real company in Bangalore.
        </p>
        <a href="#booking" className="btn-primary mt-8">
          Book a meetup
        </a>
      </div>
    </section>
  );
}
