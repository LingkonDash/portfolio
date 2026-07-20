"use client";

import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const orbitRef = useRef<SVGSVGElement>(null);
  const [variant, setVariant] = useState<"default" | "link" | "button" | "card">("default");
  const [mounted, setMounted] = useState(false);
  const [isFinePointer, setIsFinePointer] = useState(false);

  useEffect(() => {
    setMounted(true);
    const mediaQuery = window.matchMedia("(pointer: fine)");
    setIsFinePointer(mediaQuery.matches);
  }, []);

  // Position tracking using GSAP quickTo
  useEffect(() => {
    if (!isFinePointer || !cursorRef.current) return;

    // quickTo is highly optimized for fast positional updates
    const xTo = gsap.quickTo(cursorRef.current, "x", { duration: 0.25, ease: "power3.out" });
    const yTo = gsap.quickTo(cursorRef.current, "y", { duration: 0.25, ease: "power3.out" });

    // Set initial position out of view
    gsap.set(cursorRef.current, { x: -100, y: -100 });

    const onMouseMove = (e: MouseEvent) => {
      // Center the cursor elements (32px wide/high)
      xTo(e.clientX - 16);
      yTo(e.clientY - 16);
    };

    window.addEventListener("mousemove", onMouseMove);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, [isFinePointer]);

  // Global Event Delegation & Click Interactions
  useEffect(() => {
    if (!isFinePointer) return;

    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const interactive = target.closest("[data-cursor]") as HTMLElement;

      if (interactive) {
        const type = interactive.getAttribute("data-cursor") as "link" | "button" | "card";
        setVariant(type || "link");
      }
    };

    const onMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const interactive = target.closest("[data-cursor]") as HTMLElement;
      if (interactive) {
        setVariant("default");
      }
    };

    const onMouseDown = () => {
      gsap.to(cursorRef.current, { scale: 0.65, duration: 0.1, ease: "power2.out" });
    };

    const onMouseUp = () => {
      // Return to active variant scale
      const targetScale = variant === "card" ? 1.8 : (variant === "link" || variant === "button" ? 1.3 : 1);
      gsap.to(cursorRef.current, { scale: targetScale, duration: 0.2, ease: "power2.out" });
    };

    document.addEventListener("mouseover", onMouseOver);
    document.addEventListener("mouseout", onMouseOut);
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("mouseup", onMouseUp);

    return () => {
      document.removeEventListener("mouseover", onMouseOver);
      document.removeEventListener("mouseout", onMouseOut);
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("mouseup", onMouseUp);
    };
  }, [isFinePointer, variant]);

  // Morph shapes & shadows depending on active variant
  useEffect(() => {
    if (!cursorRef.current) return;

    if (variant === "link" || variant === "button") {
      gsap.to(cursorRef.current, {
        scale: 1.3,
        duration: 0.3,
        ease: "power2.out",
      });
    } else if (variant === "card") {
      gsap.to(cursorRef.current, {
        scale: 1.8,
        duration: 0.3,
        ease: "power2.out",
      });
    } else {
      gsap.to(cursorRef.current, {
        scale: 1,
        duration: 0.3,
        ease: "power2.out",
      });
    }
  }, [variant]);

  // Spin orbit background continuously
  useEffect(() => {
    if (!isFinePointer || !orbitRef.current) return;
    const spin = gsap.to(orbitRef.current, {
      rotate: 360,
      duration: 10,
      repeat: -1,
      ease: "none",
    });
    return () => {
      spin.kill();
    };
  }, [isFinePointer]);

  if (!mounted || !isFinePointer) return null;

  return (
    <>
      {/* Hide native cursor globally for pointer: fine devices */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @media (pointer: fine) {
            * {
              cursor: none !important;
            }
          }
        `
      }} />

      {/* Styled cursor container */}
      <div
        ref={cursorRef}
        className="fixed top-0 left-0 w-8 h-8 pointer-events-none z-[100000] mix-blend-screen transition-opacity duration-300"
      >
        <svg
          ref={orbitRef}
          width="32"
          height="32"
          viewBox="0 0 32 32"
          fill="none"
          className="absolute inset-0"
        >
          {/* Outer orbit/ring representing the spaceship trail */}
          <circle
            cx="16"
            cy="16"
            r="12"
            stroke="var(--color-accent)"
            strokeWidth="1"
            strokeDasharray="4 8"
            className="opacity-70"
          />
          {/* Small orbiting spaceship */}
          <circle
            cx="16"
            cy="4"
            r="2"
            fill="var(--color-accent)"
            className="shadow-lg shadow-accent"
          />
        </svg>

        {/* Center black hole core */}
        <div
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-300 ${
            variant === "card"
              ? "w-1.5 h-1.5 bg-accent/40"
              : variant === "link" || variant === "button"
              ? "w-3 h-3 bg-accent"
              : "w-2.5 h-2.5 bg-accent"
          }`}
          style={{
            boxShadow: `0 0 8px var(--color-accent)`,
          }}
        />
      </div>
    </>
  );
}
