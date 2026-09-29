"use client";

import { useState } from "react";
import type { PricingPlan, Zone } from "@/lib/types";
import { trackEvent } from "@/lib/meta/pixel";
import CheckoutModal from "./CheckoutModal";

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "919622323171";

function findTalkPlan(plans: PricingPlan[]): PricingPlan | null {
  const talk = plans
    .filter((p) => /talk|call/i.test(p.title))
    .sort((a, b) => a.price_inr - b.price_inr)[0];
  if (talk) return talk;
  return [...plans].sort((a, b) => a.price_inr - b.price_inr)[0] ?? null;
}

export default function StickyBookBar({ plans, zones }: { plans: PricingPlan[]; zones: Zone[] }) {
  const [checkoutPlan, setCheckoutPlan] = useState<PricingPlan | null>(null);
  const talkPlan = findTalkPlan(plans);

  if (!talkPlan) return null;

  return (
    <>
      <div className="fixed inset-x-0 bottom-0 z-40 flex items-stretch gap-2 border-t border-black/10 bg-cream/95 p-2.5 pb-[calc(0.625rem+env(safe-area-inset-bottom))] shadow-[0_-4px_16px_rgba(0,0,0,0.06)] backdrop-blur-sm sm:hidden">
        <a
          href={`https://wa.me/${WHATSAPP_NUMBER}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="WhatsApp us"
          onClick={() => trackEvent("Contact")}
          className="flex w-12 flex-shrink-0 items-center justify-center rounded-xl bg-[#25D366] text-xl active:scale-95"
        >
          💬
        </a>
        <button onClick={() => setCheckoutPlan(talkPlan)} className="btn-primary flex-1 !py-0 text-sm">
          📞 Talk now — ₹{talkPlan.price_inr.toLocaleString("en-IN")} | Book →
        </button>
      </div>
      {checkoutPlan && (
        <CheckoutModal plan={checkoutPlan} zones={zones} onClose={() => setCheckoutPlan(null)} />
      )}
    </>
  );
}
