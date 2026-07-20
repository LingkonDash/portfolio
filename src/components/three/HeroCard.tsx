"use client";

import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

export default function HeroCard() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const [isFinePointer, setIsFinePointer] = useState(false);

  useEffect(() => {
    // Detect pointer type for hover parallax triggers
    const mediaQuery = window.matchMedia("(pointer: fine)");
    setIsFinePointer(mediaQuery.matches);
  }, []);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    if (isFinePointer) {
      const container = containerRef.current;
      const card = cardRef.current;
      const glow = glowRef.current;
      if (!container || !card) return;

      const handleMouseMove = (e: MouseEvent) => {
        const rect = container.getBoundingClientRect();
        const x = e.clientX - rect.left; // x position within container
        const y = e.clientY - rect.top;  // y position within container

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        // Calculate rotation degrees (max 10 degrees)
        const rotateY = ((x - centerX) / centerX) * 10;
        const rotateX = -((y - centerY) / centerY) * 10;

        // Update card tilt and shifting shadow
        gsap.to(card, {
          rotateX: rotateX,
          rotateY: rotateY,
          transformPerspective: 1000,
          boxShadow: `${-rotateY * 2}px ${rotateX * 2 + 15}px 30px rgba(0, 0, 0, 0.4), 0 0 40px var(--color-accent) / 0.1`,
          duration: 0.3,
          ease: "power2.out",
        });

        // Shift radial glow element inside card
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
        // Reset card pose smoothly
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
    } else {
      // Mobile / touch layout fallback: slow continuous floating animation
      const card = cardRef.current;
      if (!card) return;

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
  }, [isFinePointer]);

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-[340px] aspect-[4/5] mx-auto flex items-center justify-center p-4 cursor-none"
      style={{ perspective: "1000px" }}
    >
      <div
        ref={cardRef}
        data-cursor="card"
        className="relative w-full h-full rounded-2xl bg-background-elevated/40 border border-border/50 overflow-hidden flex flex-col items-center justify-center shadow-2xl transition-colors duration-300"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Glow effect follower */}
        <div
          ref={glowRef}
          className="absolute -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-accent rounded-full pointer-events-none filter blur-2xl opacity-0 transition-opacity"
        />

        {/* 
          TODO: Replace this placeholder with the actual developer image.
          Example layout:
          <Image
            src="/images/avatar.jpg"
            alt="Lingkon Dash"
            fill
            className="object-cover rounded-2xl pointer-events-none"
          />
        */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 select-none pointer-events-none z-10">
          <div className="w-20 h-20 rounded-full border border-accent/35 flex items-center justify-center text-accent text-3xl font-extrabold tracking-tighter bg-accent/5 backdrop-blur-sm shadow-[0_0_15px_var(--color-accent)/0.1]">
            LD
          </div>
          <p className="text-xs font-mono uppercase tracking-widest text-muted/70">
            [ Developer Photo ]
          </p>
        </div>

        {/* Abstract space wireframes */}
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none" />
      </div>
    </div>
  );
}
