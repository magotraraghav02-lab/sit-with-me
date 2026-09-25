const NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "919310891615";

export default function WhatsAppButton() {
  const message = encodeURIComponent(
    "Hi! I'd like to know more about booking a meetup with SIT WITH ME.",
  );

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-2">
      <span
        className="wa-tooltip hidden select-none whitespace-nowrap rounded-lg bg-ink px-3 py-1.5 text-sm text-cream shadow-md sm:block"
        aria-hidden="true"
      >
        Talk to us 💬
      </span>
      <a
        href={`https://wa.me/${NUMBER}?text=${message}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with us on WhatsApp"
        className="wa-fab flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-lg transition hover:scale-105 active:scale-95"
      >
        <svg viewBox="0 0 32 32" className="h-7 w-7 fill-white" aria-hidden="true">
          <path d="M16.004 3C9.377 3 4 8.377 4 15.004c0 2.457.646 4.76 1.853 6.766L4 29l7.42-1.812a11.94 11.94 0 0 0 4.584.912h.005c6.627 0 12.004-5.377 12.004-12.004C28.013 8.377 22.636 3 16.004 3zm0 21.86h-.004a9.9 9.9 0 0 1-5.045-1.383l-.362-.215-3.664.895.978-3.573-.236-.367a9.86 9.86 0 0 1-1.514-5.213c0-5.463 4.446-9.909 9.912-9.909 2.648 0 5.134 1.032 7.007 2.906a9.84 9.84 0 0 1 2.898 7.008c0 5.463-4.447 9.851-9.97 9.851zm5.44-7.4c-.298-.149-1.762-.87-2.036-.969-.273-.099-.472-.149-.67.15-.198.297-.767.968-.94 1.167-.174.198-.347.223-.645.074-.298-.149-1.259-.464-2.398-1.48-.887-.79-1.486-1.767-1.66-2.065-.174-.298-.019-.459.13-.607.134-.133.298-.347.446-.52.15-.174.198-.298.298-.497.099-.198.05-.372-.025-.52-.075-.15-.67-1.614-.918-2.212-.242-.581-.487-.502-.67-.512l-.57-.01a1.09 1.09 0 0 0-.79.372c-.273.298-1.04 1.017-1.04 2.48 0 1.464 1.065 2.878 1.213 3.076.149.198 2.096 3.2 5.08 4.487.71.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.762-.72 2.01-1.415.248-.694.248-1.29.174-1.414-.075-.124-.273-.198-.57-.347z" />
        </svg>
      </a>
    </div>
  );
}
