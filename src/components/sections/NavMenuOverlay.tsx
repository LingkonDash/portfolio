"use client";

import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { usePathname, useRouter } from "next/navigation";
import { scrollToSection } from "@/lib/scroll";

interface NavMenuOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  activeSection: string;
}

const navLinks = [
  { label: "Home", href: "#hero", key: "home" },
  { label: "About", href: "#about", key: "about" },
  { label: "Skills", href: "#skills", key: "skills" },
  { label: "Projects", href: "#projects", key: "projects" },
  { label: "Connect", href: "#contact", key: "connect" },
];

export default function NavMenuOverlay({ isOpen, onClose, activeSection }: NavMenuOverlayProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const linksRef = useRef<(HTMLButtonElement | null)[]>([]);
  const pathname = usePathname();
  const router = useRouter();
  const [pendingHash, setPendingHash] = useState<string | null>(null);

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

    if (isOpen) {
      // Open animation
      gsap.killTweensOf([overlayRef.current, linksRef.current]);

      if (prefersReducedMotion) {
        gsap.set(overlayRef.current, { display: "flex", opacity: 0 });
        gsap.to(overlayRef.current, { opacity: 1, duration: 0.2, ease: "power2.out" });
      } else {
        // Curtain clip-path drop
        gsap.set(overlayRef.current, {
          display: "flex",
          clipPath: "polygon(0 0, 100% 0, 100% 0, 0 0)",
        });
        gsap.to(overlayRef.current, {
          clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
          duration: 0.85,
          ease: "power4.inOut",
        });

        // Stagger links entrance
        gsap.fromTo(
          linksRef.current.filter(Boolean),
          { y: 50, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, delay: 0.3, stagger: 0.1, ease: "power3.out" }
        );
      }
    } else {
      // Close animation
      gsap.killTweensOf([overlayRef.current, linksRef.current]);

      if (prefersReducedMotion) {
        gsap.to(overlayRef.current, {
          opacity: 0,
          duration: 0.2,
          ease: "power2.in",
          onComplete: () => {
            gsap.set(overlayRef.current, { display: "none" });
          },
        });
      } else {
        // Wipe overlay upwards/outwards
        gsap.to(overlayRef.current, {
          clipPath: "polygon(0 0, 100% 0, 100% 0, 0 0)",
          duration: 0.6,
          ease: "power4.inOut",
          onComplete: () => {
            gsap.set(overlayRef.current, { display: "none" });
          },
        });
      }
    }
  }, [isOpen]);

  const handleLinkClick = (href: string) => {
    onClose();
    const hash = href.startsWith("#") ? href : `#${href}`;

    const scrollToHash = () => {
      scrollToSection(hash, { behavior: "smooth" });
    };

    if (pathname === "/") {
      setTimeout(scrollToHash, 350);
      return;
    }

    setPendingHash(hash);
    router.push(`/${hash}`, { scroll: false });
  };

  useEffect(() => {
    if (!pendingHash || pathname !== "/") return;

    if (scrollToSection(pendingHash, { behavior: "smooth" })) {
      setPendingHash(null);
    }
  }, [pendingHash, pathname]);

  // Modern GSAP hover effect (3D skew tilt + scale)
  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>, index: number) => {
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

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>, index: number) => {
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
      className="fixed inset-0 w-screen h-screen hidden flex-col justify-center items-center bg-background/97 backdrop-blur-md z-[999] overflow-hidden"
    >
      {/* Click outside target element to close */}
      <div className="absolute inset-0 z-0" onClick={onClose} />

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
                <button
                  ref={(el) => {
                    linksRef.current[index] = el;
                  }}
                  onClick={() => handleLinkClick(link.href)}
                  onMouseEnter={(e) => handleMouseEnter(e, index)}
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
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
