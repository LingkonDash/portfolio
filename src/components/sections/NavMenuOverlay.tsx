"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { usePathname } from "next/navigation";
import { scrollToSection } from "@/lib/scroll";

interface NavMenuOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  activeSection: string;
}

const navLinks = [
  { label: "Home", href: "/#hero", key: "home" },
  { label: "About", href: "/#about", key: "about" },
  { label: "Skills", href: "/#skills", key: "skills" },
  { label: "Projects", href: "/#projects", key: "projects" },
  { label: "Connect", href: "/#connect", key: "connect" },
];

export default function NavMenuOverlay({ isOpen, onClose, activeSection }: NavMenuOverlayProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const linksRef = useRef<(HTMLAnchorElement | null)[]>([]);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const reducedMotionRef = useRef<boolean | null>(null);
  const pathname = usePathname();

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Handle open/close GSAP animations
  useEffect(() => {
    if (!overlayRef.current) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const shouldRebuildTimeline = !timelineRef.current || reducedMotionRef.current !== prefersReducedMotion;

    if (shouldRebuildTimeline) {
      timelineRef.current?.kill();
      reducedMotionRef.current = prefersReducedMotion;

      const tl = gsap.timeline({ paused: true });
      if (prefersReducedMotion) {
        tl.set(overlayRef.current, { display: "none", opacity: 0 })
          .set(overlayRef.current, { display: "flex" })
          .to(overlayRef.current, { opacity: 1, duration: 0.2, ease: "power2.out" });
      } else {
        tl.set(overlayRef.current, {
          display: "none",
          clipPath: "polygon(0 0, 100% 0, 100% 0, 0 0)",
        })
          .set(overlayRef.current, { display: "flex" })
          .to(overlayRef.current, {
            clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
            duration: 0.85,
            ease: "power4.inOut",
          })
          .fromTo(
            linksRef.current.filter(Boolean),
            { y: 50, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.6,
              stagger: 0.1,
              ease: "power3.out",
            },
            0.3
          );
      }

      tl.eventCallback("onReverseComplete", () => {
        if (overlayRef.current) {
          gsap.set(overlayRef.current, { display: "none" });
        }
      });

      timelineRef.current = tl;
    }

    if (isOpen) {
      timelineRef.current?.play();
    } else {
      timelineRef.current?.reverse();
    }
  }, [isOpen]);

  const handleLinkClick = (event: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    onClose();

    if (pathname === "/") {
      event.preventDefault();
      const hash = href.startsWith("/#") ? href.slice(1) : href;
      scrollToSection(hash, { behavior: "smooth" });
    }
  };

  // Modern GSAP hover effect (3D skew tilt + scale)
  const handleMouseEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const el = e.currentTarget;
    const underline = el.querySelector(".nav-underline");

    gsap.to(el, {
      scale: 1.08,
      skewX: -6,
      color: "var(--color-accent)",
      duration: 0.3,
      ease: "power2.out",
    });

    if (underline) {
      gsap.to(underline, {
        scaleX: 1,
        duration: 0.3,
        ease: "power2.out",
      });
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLAnchorElement>, index: number) => {
    const el = e.currentTarget;
    const underline = el.querySelector(".nav-underline");
    const isActive = activeSection === navLinks[index].key;

    gsap.to(el, {
      scale: 1,
      skewX: 0,
      color: isActive ? "var(--color-accent)" : "var(--color-fg)",
      duration: 0.3,
      ease: "power2.out",
    });

    if (underline && !isActive) {
      gsap.to(underline, {
        scaleX: 0,
        duration: 0.3,
        ease: "power2.out",
      });
    }
  };

  return (
    <div
      ref={overlayRef}
      style={{ display: "none" }}
      className="fixed inset-0 w-screen h-screen flex-col justify-center items-center bg-background/97 backdrop-blur-md z-[1001] overflow-hidden"
    >
      {/* Click outside target element to close */}
      <div className="absolute inset-0 z-0" onClick={onClose} />

      <button
        type="button"
        onClick={onClose}
        aria-label="Close menu"
        data-cursor="button"
        className="absolute top-6 right-6 md:top-8 md:right-8 z-20 flex items-center justify-center w-6 h-6 text-foreground hover:text-accent transition-colors"
      >
        <span className="sr-only">Close menu</span>
        <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" aria-hidden="true">
          <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </button>

      <div
        ref={containerRef}
        className="relative z-10 w-full max-w-5xl h-full flex flex-col justify-center p-8 md:p-16"
      >
        {/* Fullscreen Grid Layout: 5 links arranged in a modern quadrant/split layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 w-full max-w-4xl mx-auto">
          {navLinks.map((link, index) => {
            const isActive = activeSection === link.key;
            return (
              <div
                key={link.key}
                className={`flex justify-start ${
                  index === 4 ? "md:col-span-2 md:justify-center mt-4" : ""
                }`}
              >
                <Link
                  href={link.href}
                  ref={(el) => {
                    linksRef.current[index] = el;
                  }}
                  onClick={(event) => handleLinkClick(event, link.href)}
                  onMouseEnter={(e) => handleMouseEnter(e)}
                  onMouseLeave={(e) => handleMouseLeave(e, index)}
                  data-cursor="link"
                  className="group relative flex items-baseline gap-4 text-left font-sans text-5xl md:text-7xl font-bold tracking-tighter transition-colors select-none"
                  style={{
                    color: isActive ? "var(--color-accent)" : "var(--color-fg)",
                  }}
                >
                  <span className="text-sm font-mono text-muted/60 tracking-wider uppercase">
                    0{index + 1}
                  </span>
                  <span>{link.label}</span>

                  {/* Underline draw animation */}
                  <span
                    className="nav-underline absolute left-0 bottom-0 w-full h-[3px] bg-accent origin-left"
                    style={{
                      transform: isActive ? "scaleX(1)" : "scaleX(0)",
                      transformOrigin: "left",
                    }}
                  />
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
