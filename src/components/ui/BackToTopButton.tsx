'use client';

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export default function BackToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      const threshold = window.innerHeight * 0.5;
      setIsVisible(window.scrollY > threshold);
    };

    toggleVisibility();
    window.addEventListener("scroll", toggleVisibility, { passive: true });

    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!isVisible) return null;

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Back to top"
      data-cursor="button"
      className="group fixed bottom-6 right-6 md:bottom-8 md:right-8 z-[1002] flex h-12 w-12 items-center justify-center rounded-full border border-accent/30 bg-background-elevated/90 backdrop-blur-md text-foreground shadow-[0_0_24px_rgba(0,0,0,0.18)] transition-all duration-300 hover:-translate-y-1 hover:border-accent hover:text-accent motion-safe:animate-[float_2.4s_ease-in-out_infinite]"
    >
      <ArrowUp className="h-5 w-5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:scale-110" />
    </button>
  );
}
