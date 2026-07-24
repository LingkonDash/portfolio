"use client";

import { useEffect, useState } from "react";
import type { RefObject } from "react";
import { gsap } from "gsap";

interface UseTiltCardOptions {
  containerRef: RefObject<HTMLElement | null>;
  cardRef: RefObject<HTMLElement | null>;
  glowRef?: RefObject<HTMLElement | null>;
  enableMobileFloat?: boolean;
}

export function useTiltCard({
  containerRef,
  cardRef,
  glowRef,
  enableMobileFloat = false,
}: UseTiltCardOptions) {
  const [isFinePointer, setIsFinePointer] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(pointer: fine)");
    setIsFinePointer(mediaQuery.matches);
  }, []);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const container = containerRef.current;
    const card = cardRef.current;
    const glow = glowRef?.current;

    if (!container || !card) return;

    if (isFinePointer) {
      const handleMouseMove = (e: MouseEvent) => {
        const rect = container.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateY = ((x - centerX) / centerX) * 10;
        const rotateX = -((y - centerY) / centerY) * 10;

        gsap.to(card, {
          rotateX,
          rotateY,
          transformPerspective: 1000,
          boxShadow: `${-rotateY * 2}px ${rotateX * 2 + 15}px 30px rgba(0, 0, 0, 0.4), 0 0 40px var(--color-accent) / 0.1`,
          duration: 0.3,
          ease: "power2.out",
        });

        if (glow) {
          gsap.to(glow, {
            left: `${x}px`,
            top: `${y}px`,
            opacity: 0.15,
            duration: 0.3,
          });
        }
      };

      const handleMouseLeave = () => {
        gsap.to(card, {
          rotateX: 0,
          rotateY: 0,
          boxShadow: "0 10px 25px rgba(0, 0, 0, 0.3)",
          duration: 0.6,
          ease: "power2.out",
        });

        if (glow) {
          gsap.to(glow, {
            opacity: 0,
            duration: 0.6,
          });
        }
      };

      container.addEventListener("mousemove", handleMouseMove);
      container.addEventListener("mouseleave", handleMouseLeave);

      return () => {
        container.removeEventListener("mousemove", handleMouseMove);
        container.removeEventListener("mouseleave", handleMouseLeave);
      };
    }

    if (enableMobileFloat) {
      const floatAnim = gsap.to(card, {
        y: -12,
        duration: 2.2,
        repeat: -1,
        yoyo: true,
        ease: "power1.inOut",
      });

      return () => {
        floatAnim.kill();
      };
    }

    return undefined;
  }, [containerRef, cardRef, glowRef, enableMobileFloat, isFinePointer]);
}
