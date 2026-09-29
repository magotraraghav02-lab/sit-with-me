"use client";

import type { Attribution } from "./types";

const STORAGE_KEY = "sw_attribution_v1";

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"] as const;

/** First-touch attribution: captured once per browser, never overwritten by a
 * later visit without UTM params (e.g. the customer coming straight back to
 * finish booking). Call this once, as early as possible (MetaPixel mounts it). */
export function captureAttribution(): void {
  try {
    if (localStorage.getItem(STORAGE_KEY)) return; // already captured

    const params = new URLSearchParams(window.location.search);
    const hasAnyParam = [...UTM_KEYS, "fbclid"].some((k) => params.get(k));
    if (!hasAnyParam) return; // nothing to capture yet; try again on a later page/visit

    const attribution: Attribution = {
      utmSource: params.get("utm_source"),
      utmMedium: params.get("utm_medium"),
      utmCampaign: params.get("utm_campaign"),
      utmTerm: params.get("utm_term"),
      utmContent: params.get("utm_content"),
      fbclid: params.get("fbclid"),
      landingPage: window.location.pathname + window.location.search,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(attribution));
  } catch {
    // localStorage can be unavailable (private mode, etc.) -- non-fatal
  }
}

export function getAttribution(): Attribution {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Attribution;
  } catch {
    // ignore
  }
  return {
    utmSource: null,
    utmMedium: null,
    utmCampaign: null,
    utmTerm: null,
    utmContent: null,
    fbclid: null,
    landingPage: null,
  };
}

function readCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

/** Meta's own click-id/browser-id cookies, set automatically once the base
 * Pixel script loads. Used to raise CAPI event match quality. */
export function getMetaBrowserIds(): { fbp: string | null; fbc: string | null } {
  try {
    return { fbp: readCookie("_fbp"), fbc: readCookie("_fbc") };
  } catch {
    return { fbp: null, fbc: null };
  }
}
