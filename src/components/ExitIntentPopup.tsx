"use client";

import { useEffect, useRef, useState } from "react";

const STORAGE_KEY = "sw_exit_intent_shown_v1";
const COUPON_CODE = "FIRST50";
const SCROLL_DOWN_THRESHOLD = 500; // px scrolled down before a back-scroll counts as "leaving"
const BACK_SCROLL_SPEED = 40; // px of upward scroll in one tick to count as a quick flick back up

export default function ExitIntentPopup() {
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const maxScrollRef = useRef(0);
  const lastScrollYRef = useRef(0);
  const shownRef = useRef(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY)) shownRef.current = true;
    } catch {
      // ignore
    }

    function trigger() {
      if (shownRef.current) return;
      shownRef.current = true;
      setVisible(true);
      try {
        localStorage.setItem(STORAGE_KEY, "1");
      } catch {
        // ignore
      }
    }

    function handleMouseOut(e: MouseEvent) {
      if (e.clientY <= 0 && !e.relatedTarget) trigger();
    }

    function handleScroll() {
      const y = window.scrollY;
      maxScrollRef.current = Math.max(maxScrollRef.current, y);
      const scrolledUpFast = lastScrollYRef.current - y > BACK_SCROLL_SPEED;
      if (maxScrollRef.current > SCROLL_DOWN_THRESHOLD && scrolledUpFast && y < 200) {
        trigger();
      }
      lastScrollYRef.current = y;
    }

    document.addEventListener("mouseout", handleMouseOut);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      document.removeEventListener("mouseout", handleMouseOut);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  if (!visible) return null;

  function copyCode() {
    navigator.clipboard?.writeText(COUPON_CODE).then(() => setCopied(true));
  }

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-ink/50 p-0 sm:items-center sm:p-5"
      role="dialog"
      aria-modal="true"
      onClick={(e) => e.target === e.currentTarget && setVisible(false)}
    >
      <div className="card w-full max-w-sm p-6 text-center animate-modal-in sm:p-8">
        <button
          onClick={() => setVisible(false)}
          aria-label="Close"
          className="float-right -mt-2 -mr-2 text-2xl leading-none text-muted hover:text-ink"
        >
          &times;
        </button>
        <p className="mb-1 text-3xl">👋</p>
        <h3 className="mb-2 text-lg font-semibold text-ink">First time?</h3>
        <p className="mb-4 text-sm text-muted">
          Get ₹50 off your first meetup with code
        </p>
        <button
          onClick={copyCode}
          className="mb-4 w-full rounded-xl border-2 border-dashed border-forest/40 bg-forest/5 px-4 py-3 font-mono text-lg font-semibold tracking-wide text-forest"
        >
          {copied ? "Copied ✓" : `${COUPON_CODE} — tap to copy`}
        </button>
        <p className="text-xs text-muted">Paste it in the coupon field when you book.</p>
      </div>
    </div>
  );
}
