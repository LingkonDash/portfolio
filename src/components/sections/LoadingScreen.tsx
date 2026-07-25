"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import ShipIcon from "@/components/ui/ShipIcon";

interface LoadingScreenProps {
  active?: boolean;
  progress?: number;
  variant?: "initial" | "route";
}

export default function LoadingScreen({
  active = true,
  progress = 0,
  variant = "initial",
}: LoadingScreenProps) {
  const barRef = useRef<HTMLDivElement>(null);
  const shipRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const percentRef = useRef<HTMLDivElement>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const isFirstLoad = variant === "initial";

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);
    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);
    return () => mediaQuery.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    if (!active) return;

    const bar = barRef.current;
    const ship = shipRef.current;
    const label = labelRef.current;
    const percent = percentRef.current;

    if (!bar || !ship || !label || !percent) return;

    if (prefersReducedMotion) {
      gsap.set(bar, { scaleX: Math.max(0.01, progress / 100) });
      gsap.set(ship, { left: `${Math.max(0, Math.min(progress, 100))}%` });
      gsap.set(label, { opacity: isFirstLoad ? 1 : 0.75, y: 0 });
      gsap.set(percent, { opacity: 1, y: 0 });
      return;
    }

    const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
    tl.fromTo(
      label,
      { opacity: isFirstLoad ? 0 : 0.6, y: isFirstLoad ? 14 : 0 },
      { opacity: isFirstLoad ? 1 : 0.75, y: 0, duration: isFirstLoad ? 0.35 : 0.15 }
    );
    tl.fromTo(percent, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.2 }, "<0.05");

    return () => {
      tl.kill();
    };
  }, [active, prefersReducedMotion, isFirstLoad]);

  useEffect(() => {
    if (!active) return;

    const bar = barRef.current;
    const ship = shipRef.current;

    if (!bar || !ship) return;

    if (prefersReducedMotion) {
      gsap.set(bar, { scaleX: Math.max(0.01, progress / 100) });
      gsap.set(ship, { left: `${Math.max(0, Math.min(progress, 100))}%` });
      return;
    }

    gsap.to(bar, { scaleX: Math.max(0.01, progress / 100), duration: 0.16, ease: "power2.out" });
    gsap.to(ship, {
      left: `${Math.max(0, Math.min(progress, 100))}%`,
      duration: 0.16,
      ease: "power2.out",
    });
  }, [active, progress, prefersReducedMotion]);

  const statusText = useMemo(() => {
    if (isFirstLoad) return { title: "Lingkon Dash", subtitle: "Full Stack Developer" };
    return { title: "Transit", subtitle: "Loading route" };
  }, [isFirstLoad]);

  if (!active) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center overflow-hidden bg-[var(--color-bg)] px-6 py-10 text-[var(--color-fg)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(77,216,255,0.14),transparent_62%)]" />
      <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] [background-size:32px_32px]" />
      <div className="relative z-10 flex w-full max-w-xl flex-col items-center gap-6 text-center">
        <div ref={labelRef} className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.4em] text-[color:var(--color-accent)]/90">
            {statusText.title}
          </p>
          <h1 className="text-2xl font-semibold tracking-[0.16em] text-[var(--color-fg)] sm:text-3xl">
            {statusText.subtitle}
          </h1>
        </div>

        <div className="w-full max-w-md">
          <div className="relative h-1.5 overflow-hidden rounded-full border border-[color:var(--color-accent)]/25 bg-white/5 shadow-[0_0_30px_rgba(77,216,255,0.08)]">
            <div
              ref={barRef}
              className="absolute inset-y-0 left-0 w-full origin-left rounded-full bg-gradient-to-r from-[color:var(--color-accent)]/90 via-[color:var(--color-accent)] to-[color:var(--color-accent)]/60 shadow-[0_0_18px_rgba(77,216,255,0.45)]"
              style={{ transform: "scaleX(0)" }}
            />
            <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-full">
              <div className="absolute inset-y-0 left-0 w-[38%] bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.24)_40%,transparent_100%)] blur-sm" />
            </div>
            <div className="pointer-events-none absolute inset-y-0 left-0 w-[40%] rounded-full bg-gradient-to-r from-transparent via-[color:var(--color-accent)]/20 to-transparent blur-[14px]" />
            <div
              ref={shipRef}
              className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{ left: "0%" }}
            >
              <ShipIcon className="h-5 w-5 text-[color:var(--color-accent)] drop-shadow-[0_0_12px_rgba(77,216,255,0.45)]" />
            </div>
          </div>
        </div>

        <div ref={percentRef} className="font-mono text-sm font-semibold tracking-[0.32em] text-[color:var(--color-accent)]">
          {String(progress).padStart(3, "0")}%
        </div>
      </div>
    </div>
  );
}
