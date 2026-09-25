"use client";

import { useEffect } from "react";

export default function RippleLayer() {
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = (e.target as HTMLElement)?.closest(
        ".btn-primary, .btn-secondary, .book-with-link",
      ) as HTMLElement | null;
      if (!target) return;

      const rect = target.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 1.6;
      const span = document.createElement("span");
      span.className = "ripple-span";
      span.style.width = `${size}px`;
      span.style.height = `${size}px`;
      span.style.left = `${e.clientX - rect.left - size / 2}px`;
      span.style.top = `${e.clientY - rect.top - size / 2}px`;
      target.appendChild(span);

      const cleanup = () => span.remove();
      span.addEventListener("animationend", cleanup);
      setTimeout(cleanup, 700);
    }

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return null;
}
