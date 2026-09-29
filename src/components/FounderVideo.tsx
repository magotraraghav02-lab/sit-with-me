"use client";

import { useRef, useState } from "react";

export default function FounderVideo({
  videoUrl,
  captionsUrl,
}: {
  videoUrl: string | null;
  captionsUrl: string | null;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);

  if (!videoUrl) return null;

  function toggleSound() {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  }

  return (
    <section className="bg-cream">
      <div className="mx-auto max-w-3xl px-5 py-10 text-center">
        <p className="mb-4 text-sm font-medium text-muted">Hi, we&apos;re Raghav &amp; Anurag 👋</p>
        <div className="relative mx-auto w-full max-w-[280px] overflow-hidden rounded-xl2 shadow-sm ring-1 ring-black/5">
          <video
            ref={videoRef}
            src={videoUrl}
            className="aspect-[9/16] w-full bg-black object-cover"
            autoPlay
            muted
            loop
            playsInline
            onClick={toggleSound}
          >
            {captionsUrl && <track kind="captions" src={captionsUrl} srcLang="en" default />}
          </video>
          <button
            onClick={toggleSound}
            aria-label={muted ? "Tap for sound" : "Mute"}
            className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-ink/70 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm"
          >
            {muted ? "🔇 Tap for sound" : "🔊 Playing"}
          </button>
        </div>
      </div>
    </section>
  );
}
