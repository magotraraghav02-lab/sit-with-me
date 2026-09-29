"use client";

import { useState } from "react";

export default function ReferralShare({ bookingId }: { bookingId: string }) {
  const [copied, setCopied] = useState(false);
  const shareUrl = `https://sitwithme.in?ref=${bookingId.slice(0, 8)}`;
  const shareText = "I just booked a meetup with SIT WITH ME — real, platonic company in Bangalore. Worth trying:";

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({ text: shareText, url: shareUrl });
        return;
      } catch {
        // user cancelled or share failed -- fall through to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // clipboard unavailable -- nothing more we can do silently
    }
  }

  return (
    <button onClick={handleShare} className="btn-secondary w-full">
      {copied ? "Link copied ✓" : "🎁 Gift a SitWithMe to a friend"}
    </button>
  );
}
