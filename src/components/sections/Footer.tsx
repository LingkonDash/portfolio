"use client";

import React from "react";
import { scrollToSection } from "@/lib/scroll";
import SocialLinks from "@/components/ui/SocialLinks";
import { ArrowUp } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const handleBackToTop = () => {
    scrollToSection("#hero", { behavior: "smooth" });
  };

  return (
    <footer className="py-12 border-t border-border/10 bg-background/30 backdrop-blur-md select-none font-sans">
      <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left: Dynamic Copyright & Wordmark */}
        <div className="flex flex-col items-center md:items-start gap-1">
          <span className="text-sm font-bold tracking-tight text-foreground">
            Lingkon Dash
          </span>
          <span className="text-xs text-muted/50 font-mono">
            &copy; {currentYear} Lingkon Dash. All rights reserved.
          </span>
        </div>

        {/* Center: Social Links */}
        <SocialLinks />

        {/* Right: Back to Top Control */}
        <button
          onClick={handleBackToTop}
          data-cursor="link"
          className="inline-flex items-center gap-1.5 text-xs font-bold font-mono tracking-wider uppercase text-muted hover:text-accent transition-colors duration-200 py-2 px-3 rounded-lg focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
          aria-label="Scroll back to top"
        >
          <span>Back to Top</span>
          <ArrowUp size={14} className="animate-bounce" />
        </button>
      </div>
    </footer>
  );
}
