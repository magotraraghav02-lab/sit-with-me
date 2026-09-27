import Link from "next/link";
import Footer from "./Footer";

export default function PolicyPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="border-b border-black/5 bg-cream px-5 py-4">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <Link href="/" className="font-semibold text-ink hover:underline">
            ← SIT WITH ME
          </Link>
        </div>
      </div>
      <main className="bg-cream">
        <div className="mx-auto max-w-2xl px-5 py-10">
          <div className="mb-6 rounded-xl border border-amber/40 bg-amber/10 p-4 text-sm text-ink">
            <strong>Template — please review.</strong> This page was drafted so Razorpay can
            verify your website. Read it over (ideally with a lawyer) and edit the details —
            business name, contact info, and specific policy terms — before you rely on it.
          </div>
          <h1 className="text-3xl font-semibold text-ink">{title}</h1>
          <p className="mt-1 text-sm text-muted">Last updated: {updated}</p>
          <div className="policy-body mt-8 space-y-5 text-ink/90">{children}</div>
        </div>
      </main>
      <Footer />
    </>
  );
}
