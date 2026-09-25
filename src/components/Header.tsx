"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useSpring } from "framer-motion";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const { scrollYProgress } = useScroll();
  const progressScale = useSpring(scrollYProgress, {
    stiffness: 200,
    damping: 40,
    mass: 0.2,
  });

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 24);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function handleBookClick(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    document.getElementById("booking")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <>
      <motion.div
        aria-hidden
        className="fixed inset-x-0 top-0 z-[60] h-[3px] origin-left bg-gradient-to-r from-clay via-[#C9607F] to-forest"
        style={{ scaleX: progressScale }}
      />
      <header
        className={`header-bar fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-cream/70 py-2.5 shadow-sm backdrop-blur-md"
            : "bg-transparent py-4"
        }`}
      >
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5">
          <a href="#top" className="text-base font-semibold tracking-tight text-ink">
            SIT WITH ME
          </a>
          <a href="#booking" onClick={handleBookClick} className="btn-primary px-5 py-2 text-sm">
            Book a meetup
          </a>
        </div>
      </header>
    </>
  );
}
