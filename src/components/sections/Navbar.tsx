"use client";

import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePathname, useRouter } from "next/navigation";
import { scrollToSection } from "@/lib/scroll";
import ThemeSwitcher from "@/components/ui/ThemeSwitcher";
import NavMenuOverlay from "./NavMenuOverlay";

// Register GSAP ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

const sectionIds = [
  { id: "hero", key: "home" },
  { id: "about", key: "about" },
  { id: "skills", key: "skills" },
  { id: "projects", key: "projects" },
  { id: "contact", key: "connect" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [pendingSection, setPendingSection] = useState<string | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  // Morph button refs
  const topBarRef = useRef<HTMLSpanElement>(null);
  const middleBarRef = useRef<HTMLSpanElement>(null);
  const bottomBarRef = useRef<HTMLSpanElement>(null);

  // Active section tracking with ScrollTrigger
  useEffect(() => {
    const triggers: ScrollTrigger[] = [];

    sectionIds.forEach(({ id, key }) => {
      const element = document.querySelector(`#${id}`);
      if (!element) return;

      const trigger = ScrollTrigger.create({
        trigger: element,
        start: "top center",
        end: "bottom top",
        invalidateOnRefresh: true,
        onToggle: (self) => {
          if (self.isActive) {
            setActiveSection(key);
          }
        },
      });
      triggers.push(trigger);
    });

    return () => {
      triggers.forEach((t) => t.kill());
    };
  }, []);

  useEffect(() => {
    if (!pendingSection || pathname !== "/") return;

    if (scrollToSection(pendingSection, { behavior: "smooth" })) {
      setPendingSection(null);
    }
  }, [pendingSection, pathname]);

  const navigateToSection = (target: string) => {
    if (pathname === "/") {
      const targetElement = document.querySelector(`#${target}`);
      if (targetElement) {
        scrollToSection(target, { behavior: "smooth" });
        return;
      }
      setPendingSection(target);
      return;
    }

    setPendingSection(target);
    router.push(`/#${target}`, { scroll: false });
  };

  // GSAP Hamburger morphing animation
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (isOpen) {
      if (prefersReducedMotion) {
        gsap.set(topBarRef.current, { rotate: 45, y: 6 });
        gsap.set(middleBarRef.current, { opacity: 0, scaleX: 0 });
        gsap.set(bottomBarRef.current, { rotate: -45, y: -6 });
      } else {
        gsap.to(topBarRef.current, { rotate: 45, y: 6, duration: 0.4, ease: "power2.out" });
        gsap.to(middleBarRef.current, { opacity: 0, scaleX: 0, duration: 0.3, ease: "power2.out" });
        gsap.to(bottomBarRef.current, { rotate: -45, y: -6, duration: 0.4, ease: "power2.out" });
      }
    } else {
      if (prefersReducedMotion) {
        gsap.set(topBarRef.current, { rotate: 0, y: 0 });
        gsap.set(middleBarRef.current, { opacity: 1, scaleX: 1 });
        gsap.set(bottomBarRef.current, { rotate: 0, y: 0 });
      } else {
        gsap.to(topBarRef.current, { rotate: 0, y: 0, duration: 0.4, ease: "power2.out" });
        gsap.to(middleBarRef.current, { opacity: 1, scaleX: 1, duration: 0.3, ease: "power2.out" });
        gsap.to(bottomBarRef.current, { rotate: 0, y: 0, duration: 0.4, ease: "power2.out" });
      }
    }
  }, [isOpen]);

  const handleWordmarkClick = () => {
    if (isOpen) setIsOpen(false);
    navigateToSection("hero");
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 h-20 flex items-center justify-between px-6 md:px-12 bg-background/60 backdrop-blur-md border-b border-border/30 z-[1000] select-none">
        {/* Left: Wordmark Logo */}
        <button
          onClick={handleWordmarkClick}
          data-cursor="link"
          className="flex items-center gap-3 text-lg md:text-xl font-bold tracking-tight text-foreground hover:text-accent transition-colors"
        >
          <span>Lingkon Dash</span>
          {/* Active section dot indicator */}
          <span
            className="w-1.5 h-1.5 rounded-full bg-accent transition-opacity duration-300 shadow-[0_0_8px_var(--color-accent)]"
            style={{ opacity: isOpen ? 0 : 1 }}
          />
        </button>

        {/* Right Controls */}
        <div className="flex items-center gap-6">
          {/* Theme switcher */}
          <ThemeSwitcher />

          {/* GSAP Custom Hamburger Morph trigger */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            aria-expanded={isOpen}
            aria-label="Toggle menu"
            data-cursor="button"
            className="relative flex flex-col justify-between w-6 h-[14px] cursor-pointer group bg-transparent border-none p-0 outline-none"
          >
            <span
              ref={topBarRef}
              className="w-full h-[2px] bg-foreground rounded-full origin-center"
            />
            <span
              ref={middleBarRef}
              className="w-full h-[2px] bg-foreground rounded-full origin-center"
            />
            <span
              ref={bottomBarRef}
              className="w-full h-[2px] bg-foreground rounded-full origin-center"
            />
          </button>
        </div>
      </header>

      {/* Fullscreen Overlay */}
      <NavMenuOverlay
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        activeSection={activeSection}
      />
    </>
  );
}
