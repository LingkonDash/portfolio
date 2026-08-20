// HeroCard.tsx
"use client";

import Image from "next/image";
import React, { useEffect, useMemo, useRef } from "react";
import { gsap } from "gsap";
import { useTiltCard } from "@/hooks/useTiltCard";

interface Particle {
  angle: number;
  size: number;
  delay: number;
  duration: number;
}

const PARTICLE_COUNT = 8;
const TICK_COUNT = 24;

function buildParticles(count: number): Particle[] {
  const particles: Particle[] = [];
  for (let i = 0; i < count; i++) {
    const seed = Math.abs(Math.sin(i * 23.14) * 39871.4) % 1;
    particles.push({
      angle: (360 / count) * i,
      size: 2 + seed * 2,
      delay: (i % 5) * 0.6,
      duration: 4 + seed * 2.5,
    });
  }
  return particles;
}

export default function HeroCard() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const ringOuterRef = useRef<HTMLDivElement>(null);
  const ringInnerRef = useRef<HTMLDivElement>(null);
  const orbitARef = useRef<HTMLDivElement>(null);
  const orbitBRef = useRef<HTMLDivElement>(null);
  const scanlineRef = useRef<HTMLDivElement>(null);
  const particleRefs = useRef<(HTMLSpanElement | null)[]>([]);

  const particles = useMemo(() => buildParticles(PARTICLE_COUNT), []);
  const ticks = useMemo(() => Array.from({ length: TICK_COUNT }, (_, i) => (360 / TICK_COUNT) * i), []);

  useTiltCard({
    containerRef,
    cardRef,
    glowRef,
    enableMobileFloat: true,
  });

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      if (ringOuterRef.current) {
        gsap.to(ringOuterRef.current, { rotate: 360, duration: 26, repeat: -1, ease: "none" });
      }
      if (ringInnerRef.current) {
        gsap.to(ringInnerRef.current, { rotate: -360, duration: 18, repeat: -1, ease: "none" });
      }
      if (orbitARef.current) {
        gsap.to(orbitARef.current, { rotate: 360, duration: 7, repeat: -1, ease: "none" });
      }
      if (orbitBRef.current) {
        gsap.to(orbitBRef.current, { rotate: -360, duration: 11, repeat: -1, ease: "none" });
      }

      if (scanlineRef.current) {
        gsap.fromTo(
          scanlineRef.current,
          { yPercent: -120, opacity: 0 },
          {
            yPercent: 220,
            opacity: 1,
            duration: 2.2,
            repeat: -1,
            repeatDelay: 1.6,
            ease: "power1.inOut",
          }
        );
      }

      particleRefs.current.forEach((el, i) => {
        if (!el) return;
        const p = particles[i];
        const rad = (p.angle * Math.PI) / 180;
        const startX = Math.cos(rad) * 90;
        const startY = Math.sin(rad) * 90;
        const endX = Math.cos(rad) * 140;
        const endY = Math.sin(rad) * 140;

        gsap.set(el, { x: startX, y: startY, opacity: 0 });
        gsap.to(el, {
          x: endX,
          y: endY,
          opacity: 0,
          duration: p.duration,
          delay: p.delay,
          repeat: -1,
          ease: "power1.out",
          onRepeat: () => gsap.set(el, { x: startX, y: startY }),
          onStart: () => gsap.set(el, { opacity: 0.85 }),
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, [particles]);

  return (
    <div
      ref={containerRef}
      className="relative aspect-square w-full max-w-[300px] mx-auto flex items-center justify-center cursor-none"
      style={{ perspective: "1000px" }}
    >
      {/* Radar tick marks — outline only, no fill */}
      <div className="absolute inset-0 pointer-events-none">
        {ticks.map((deg, i) => (
          <span
            key={deg}
            className="absolute left-1/2 top-1/2 h-2 w-px bg-accent/30"
            style={{
              transform: `rotate(${deg}deg) translateY(-148px)`,
              opacity: i % 3 === 0 ? 0.6 : 0.25,
            }}
          />
        ))}
      </div>

      {/* Counter-rotating orbit rings — outlines only */}
      <div
        ref={ringOuterRef}
        className="absolute inset-[-22px] rounded-full border border-dashed border-accent/35 pointer-events-none"
      />
      <div
        ref={ringInnerRef}
        className="absolute inset-[-8px] rounded-full border border-dotted border-accent/25 pointer-events-none"
      />

      {/* Orbiting nodes */}
      <div ref={orbitARef} className="absolute inset-[-22px] pointer-events-none">
        <span className="absolute left-1/2 top-0 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-accent shadow-[0_0_8px] shadow-accent" />
      </div>
      <div ref={orbitBRef} className="absolute inset-[-8px] pointer-events-none">
        <span className="absolute left-0 top-1/2 h-1 w-1 -translate-y-1/2 rounded-full bg-accent/80" />
      </div>

      {/* Stardust particles firing outward */}
      {particles.map((p, i) => (
        <span
          key={p.angle}
          ref={(el) => {
            particleRefs.current[i] = el;
          }}
          className="absolute left-1/2 top-1/2 rounded-full bg-accent pointer-events-none"
          style={{ width: p.size, height: p.size, opacity: 0 }}
        />
      ))}

      {/* Circular hologram frame — no fill, just the image + glow */}
      <div
        ref={cardRef}
        data-cursor="card"
        className="relative h-[86%] w-[86%] rounded-full overflow-hidden flex items-center justify-center"
        style={{ transformStyle: "preserve-3d" }}
      >
        <div
          ref={glowRef}
          className="absolute -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-accent rounded-full pointer-events-none filter blur-2xl opacity-0 transition-opacity"
        />

        <Image
          src="/images/avatar4.jpeg"
          alt="Lingkon Dash"
          fill
          sizes="(max-width: 340px) 90vw, 300px"
          className="object-cover rounded-full pointer-events-none"
        />

        <div className="absolute inset-0 rounded-full ring-1 ring-accent/40 pointer-events-none" />

        <div
          ref={scanlineRef}
          className="absolute left-0 right-0 h-14 bg-gradient-to-b from-transparent via-accent/30 to-transparent pointer-events-none mix-blend-screen opacity-0"
          style={{ transform: "translateZ(20px)" }}
        />
      </div>
    </div>
  );
}