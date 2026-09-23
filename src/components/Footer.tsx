export default function Footer() {
  return (
    <footer className="bg-ink px-5 py-10 text-center text-sm text-cream/70">
      <div className="mx-auto max-w-2xl space-y-3">
        <a
          href="https://instagram.com/YOUR_HANDLE"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block font-medium text-cream hover:underline"
        >
          Follow us on Instagram
        </a>
        <p>We only use your details to arrange your meetup and never share them.</p>
        <p className="text-cream/50">
          If you're in crisis or thinking of harming yourself, please call Tele-MANAS at{" "}
          <a href="tel:14416" className="underline">
            14416
          </a>{" "}
          (free, 24/7).
        </p>
        <p className="pt-4 text-xs text-cream/40">SIT WITH ME · Bangalore · 18+ only</p>
      </div>
    </footer>
  );
}
