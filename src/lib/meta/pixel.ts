"use client";

import { getAttribution, getMetaBrowserIds } from "@/lib/attribution";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

export type MetaEventName =
  | "PageView"
  | "ViewContent"
  | "InitiateCheckout"
  | "AddPaymentInfo"
  | "Contact";

/** Fires a client-side Pixel event AND its server-side CAPI twin (same
 * event_id, so Meta dedupes the pair). Purchase is intentionally not fireable
 * from here -- it only fires server-side, from the Razorpay webhook, once
 * payment is actually confirmed. */
export function trackEvent(eventName: MetaEventName, customData?: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  const eventId =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${eventName}_${Date.now()}_${Math.random().toString(36).slice(2)}`;

  try {
    window.fbq?.("track", eventName, customData ?? {}, { eventID: eventId });
  } catch {
    // fbq not ready yet -- the CAPI call below still lands independently.
  }

  const attribution = getAttribution();
  const { fbp, fbc } = getMetaBrowserIds();

  fetch("/api/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      eventName,
      eventId,
      customData,
      fbp,
      fbc,
      fbclid: attribution.fbclid,
      eventSourceUrl: window.location.href,
    }),
    keepalive: true,
  }).catch(() => {});
}
