"use client";

/**
 * SmoothScrollProvider.tsx
 *
 * Initialises a global Lenis smooth-scroll instance and wires it into GSAP's
 * ticker so that both systems share the same animation loop (one rAF, not two).
 *
 * ── Fixed elements are NOT affected ──────────────────────────────────────────
 * Lenis works by translating the document body (or a wrapper element) to
 * simulate smooth scroll. Because <StarBackground> and <CustomCursor> are
 * `position: fixed`, they are taken out of normal document flow and are NOT
 * affected by any CSS transform Lenis applies. No extra handling is needed.
 *
 * ── Why NOT ScrollTrigger.normalizeScroll? ───────────────────────────────────
 * `ScrollTrigger.normalizeScroll` installs its own scroll-interception layer
 * (via GSAP Observer). Enabling it alongside Lenis creates two competing
 * scroll-event hijackers, causing stuttering and dropped frames. Since Lenis
 * already handles smoothing and normalisation, we leave normalizeScroll OFF.
 * We DO register ScrollTrigger and connect it to Lenis so that ST-driven
 * animations track the smooth scroll position, not raw scrollY.
 *
 * ── prefers-reduced-motion ───────────────────────────────────────────────────
 * Choice: set `duration` to a very low value (0.01 s) rather than destroying
 * and recreating the instance, because:
 *  - It's simpler — the same code path works for all users.
 *  - The Lenis instance still exists (other code can still call scrollTo etc.).
 *  - 0.01 s is effectively instant/native but keeps GSAP ticker sync intact.
 *  - The alternative (autoRaf native scroll) would bypass GSAP ticker and
 *    break ScrollTrigger sync.
 */

import React, { useEffect, useRef } from "react";
import { ReactLenis, type LenisRef } from "lenis/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register ScrollTrigger once (safe to call multiple times — GSAP is idempotent)
gsap.registerPlugin(ScrollTrigger);

interface SmoothScrollProviderProps {
  children: React.ReactNode;
}

export default function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  const lenisRef = useRef<LenisRef>(null);

  // Check reduced-motion preference once at mount (media query won't change at runtime)
  const prefersReducedMotion =
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false;

  useEffect(() => {
    // Wire Lenis into GSAP's ticker so both share a single rAF loop.
    // gsap.ticker fires every frame with the elapsed time in milliseconds.
    // We pass that time directly to lenis.raf(time) which expects milliseconds.
    // This replaces Lenis's own internal rAF (autoRaf: false below), preventing
    // a second rAF loop that would cause jank and desync with GSAP animations.
    const rafCallback = (time: number) => {
      lenisRef.current?.lenis?.raf(time * 1000);
    };

    gsap.ticker.add(rafCallback);

    // Disable GSAP's own lag smoothing so it doesn't fight with Lenis's lerp.
    gsap.ticker.lagSmoothing(0);

    return () => {
      // Clean up: remove the GSAP ticker callback on unmount.
      // Lenis itself is destroyed by ReactLenis's internal cleanup.
      gsap.ticker.remove(rafCallback);
    };
  }, []);

  const lenisOptions = {
    // ── Feel ────────────────────────────────────────────────────────────────
    // Duration-based mode: gives a consistent, non-physics feel across devices.
    // 1.2 s feels premium but not floaty; default easing (exponential decay) is
    // kept — it gives a natural deceleration curve.
    duration: prefersReducedMotion ? 0.01 : 1.2,

    // ── RAF control ─────────────────────────────────────────────────────────
    // MUST be false: GSAP ticker drives the loop (see useEffect above).
    // autoRaf: true would create a second rAF competing with GSAP's.
    autoRaf: false,

    // ── Smoothing ───────────────────────────────────────────────────────────
    smoothWheel: true,

    // ── Wheel sensitivity ──────────────────────────────────────────────────
    // 1.0 is default; no need to over-amplify for a portfolio.
    wheelMultiplier: 1.0,

    // ── Touch ──────────────────────────────────────────────────────────────
    // syncTouch: false (default). Touch devices typically don't need Lenis
    // smoothing — native momentum scroll feels better on mobile.
    syncTouch: false,
  };

  return (
    <ReactLenis
      root
      ref={lenisRef}
      options={lenisOptions}
    >
      {children}
    </ReactLenis>
  );
}
