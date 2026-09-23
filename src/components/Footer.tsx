const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "919310891615";

export default function Footer() {
  const whatsappMessage = encodeURIComponent(
    "Hi! I would like to know more about booking a meetup with SIT WITH ME.",
  );

  return (
    <footer className="bg-ink px-5 py-10 text-center text-sm text-cream/70">
      <div className="mx-auto max-w-2xl space-y-3">
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block font-medium text-cream hover:underline"
          >
            Message us on WhatsApp
          </a>
          <a
            href="https://instagram.com/raghavhustle"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block font-medium text-cream hover:underline"
          >
            @raghavhustle on Instagram
          </a>
          <a
            href="https://instagram.com/_fit_anurag_pandit_"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block font-medium text-cream hover:underline"
          >
            @_fit_anurag_pandit_ on Instagram
          </a>
        </div>
        <p>We only use your details to arrange your meetup and never share them.</p>
        <p className="text-cream/50">
          If you&apos;re in crisis or thinking of harming yourself, please call Tele-MANAS at{" "}
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
