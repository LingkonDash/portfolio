"use client";

import React, { useEffect, useMemo, useRef } from "react";
import { useTheme } from "next-themes";

type Star = {
  x: number;
  y: number;
  originX: number;
  originY: number;
  baseX: number;
  baseY: number;
  size: number;
  baseSize: number;
  opacity: number;
  baseOpacity: number;
  twinkle: number;
  phase: number;
  z: number;
  layer: 0 | 1 | 2;
  speed: number;
  pointerWeight: number;
  oscX: number;
  oscY: number;
  driftRadius: number;
};

type NebulaBlob = {
  x: number;
  y: number;
  vx: number; // px/ms, bounce physics — no more random target jumps
  vy: number;
  radius: number;
  accent: string;
  alpha: number;
  pulsePhase: number;
  cache: HTMLCanvasElement | null;
};

const THEME_STAR_COLORS: Record<string, string> = {
  void: "#4dd8ff",
  nebula: "#b565f5",
  solstice: "#ff8a3d",
  aurora: "#4dffb8",
  eclipse: "#d9d9e0",
};

// Perf: fewer particles on small / low-power screens.
function getStarCount(width: number, height: number): number {
  const area = width * height;
  if (width < 480) return 70;
  if (width < 768) return 130;
  if (area > 1_200_000) return 320;
  if (area > 700_000) return 230;
  return 160;
}

// Hard cap on blob count — this is the main lag lever on mobile GPUs/CPUs,
// since each blob is an offscreen-canvas drawImage composite every frame.
function getBlobCount(width: number): number {
  if (width < 480) return 2;
  if (width < 768) return 3;
  return 5;
}

// Cap DPR so high-density phones don't get a 3x/4x canvas buffer.
function getSafeDpr(width: number) {
  const raw = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
  const cap = width < 768 ? 1.5 : 2;
  return Math.min(raw, cap);
}

export default function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const blobState = useRef<NebulaBlob[]>([]);
  const { theme } = useTheme();

  const resolvedTheme = theme ?? "void";
  const accentColor =
    typeof window !== "undefined"
      ? getComputedStyle(document.documentElement).getPropertyValue("--color-accent").trim() ||
        (THEME_STAR_COLORS[resolvedTheme] ?? THEME_STAR_COLORS.void)
      : THEME_STAR_COLORS[resolvedTheme] ?? THEME_STAR_COLORS.void;

  const colorStops = useMemo(() => {
    const accent = accentColor;
    const warm = "#f2c28b";
    const cool = "#8bdcff";
    const violet = "#b38cff";
    return [accent, warm, cool, violet];
  }, [accentColor]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const isCoarsePointer =
      typeof window !== "undefined" && window.matchMedia?.("(hover: none), (pointer: coarse)").matches;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let animationFrame = 0;
    let isVisible = true;
    let lastTime = 0;
    let stars: Star[] = [];
    const pointer = { x: 0.5, y: 0.5, active: false };

    const buildStars = () => {
      const margin = Math.max(20, width * 0.03);
      const count = getStarCount(width, height);
      stars = Array.from({ length: count }, (_, index) => {
        const layer = (index % 3) as 0 | 1 | 2;
        const layerSize = [1.4, 0.95, 0.55];
        const layerOpacity = [0.92, 0.56, 0.32];
        const speed = [0.95, 0.65, 0.35][layer];
        const pointerWeight = [0.34, 0.16, 0.05][layer];
        const x = margin + Math.random() * (width - margin * 2);
        const y = margin + Math.random() * (height - margin * 2);
        const z = 0.7 + Math.random() * 0.3;
        return {
          x,
          y,
          originX: x,
          originY: y,
          baseX: x,
          baseY: y,
          size: layerSize[layer] * z,
          baseSize: layerSize[layer],
          opacity: layerOpacity[layer],
          baseOpacity: layerOpacity[layer],
          twinkle: Math.random() * Math.PI * 2,
          phase: Math.random() * Math.PI * 2,
          z,
          layer,
          speed,
          pointerWeight,
          oscX: Math.random() * Math.PI * 2,
          oscY: Math.random() * Math.PI * 2,
          driftRadius: (width < 480 ? 8 : 14) + Math.random() * 18,
        };
      });
    };

    // Bounce-physics nebula: each blob has a velocity and simply reflects off
    // the canvas edges. Position is ALWAYS clamped to [radius, dimension - radius]
    // before it's ever drawn, so a blob can structurally never paint outside the
    // canvas — no random target jumps that could overshoot, no dependence on the
    // parent container sizing correctly.
    const buildNebula = () => {
      const warm = "#f2c28b";
      const cool = "#8bdcff";
      const colors = [accentColor, warm, cool];
      const blobSizes = [0.3, 0.22, 0.16, 0.12, 0.09];
      const blobAlphas = [0.4, 0.32, 0.28, 0.22, 0.18];
      const count = getBlobCount(width);
      const minDim = Math.min(width, height);

      const blobs: NebulaBlob[] = Array.from({ length: count }, (_, index) => {
        // Radius capped relative to the smaller canvas dimension so a blob can
        // never be larger than ~30% of a narrow mobile viewport.
        const radius = Math.min(width * blobSizes[index % blobSizes.length], minDim * 0.3);

        // Spawn safely inside bounds (never touching the edge on spawn).
        const x = radius + Math.random() * Math.max(1, width - radius * 2);
        const y = radius + Math.random() * Math.max(1, height - radius * 2);

        // Slow drift speed in px/ms. Kept small + capped on mobile for perf/feel.
        const maxSpeed = width < 480 ? 0.006 : 0.012;
        const angle = Math.random() * Math.PI * 2;
        const speed = maxSpeed * (0.4 + Math.random() * 0.6);

        return {
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius,
          accent: colors[index % colors.length],
          alpha: blobAlphas[index % blobAlphas.length],
          pulsePhase: Math.random() * Math.PI * 2,
          cache: null,
        };
      });

      blobState.current = blobs;
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = getSafeDpr(width);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildStars();
      buildNebula();
    };

    // ResizeObserver on the canvas itself instead of `window` — reacts only to
    // the element's real box, debounced so mobile address-bar show/hide doesn't
    // thrash particle rebuilds.
    let resizeTimeout: ReturnType<typeof setTimeout> | null = null;
    const scheduleResize = () => {
      if (resizeTimeout) clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(resize, 120);
    };
    const resizeObserver = new ResizeObserver(scheduleResize);
    resizeObserver.observe(canvas);

    const onPointerMove = (event: MouseEvent) => {
      pointer.active = true;
      pointer.x = event.clientX / Math.max(window.innerWidth, 1);
      pointer.y = event.clientY / Math.max(window.innerHeight, 1);
    };
    const onPointerLeave = () => {
      pointer.active = false;
    };
    const onVisibilityChange = () => {
      isVisible = document.visibilityState === "visible";
      if (isVisible && !animationFrame) {
        lastTime = performance.now();
        animationFrame = window.requestAnimationFrame(render);
      }
    };

    const render = (time: number) => {
      if (!isVisible) {
        animationFrame = 0;
        return;
      }

      // Cap delta so a background-tab wakeup doesn't fling blobs across the
      // screen in one giant step.
      const dt = Math.min(48, time - (lastTime || time));
      lastTime = time;

      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "rgba(2, 3, 8, 1)";
      ctx.fillRect(0, 0, width, height);

      for (const blob of blobState.current) {
        if (!blob.cache) {
          const blobCanvas = document.createElement("canvas");
          const blobCtx = blobCanvas.getContext("2d");
          if (!blobCtx) continue;

          const size = Math.ceil(blob.radius * 2);
          blobCanvas.width = size;
          blobCanvas.height = size;

          const center = blob.radius;
          const cacheGradient = blobCtx.createRadialGradient(center, center, 0, center, center, blob.radius);
          cacheGradient.addColorStop(0, `${blob.accent}${Math.round(blob.alpha * 255).toString(16).padStart(2, "0")}`);
          cacheGradient.addColorStop(0.35, `${blob.accent}65`);
          cacheGradient.addColorStop(1, "rgba(255,255,255,0)");

          blobCtx.fillStyle = cacheGradient;
          blobCtx.beginPath();
          blobCtx.arc(center, center, blob.radius, 0, Math.PI * 2);
          blobCtx.fill();

          blob.cache = blobCanvas;
        }

        // Advance position.
        blob.x += blob.vx * dt;
        blob.y += blob.vy * dt;

        // Bounce off edges: reflect velocity and clamp position so the blob's
        // rendered circle (center ± radius) never crosses the canvas border,
        // on any side, at any viewport size.
        const minX = blob.radius;
        const maxX = width - blob.radius;
        const minY = blob.radius;
        const maxY = height - blob.radius;

        if (blob.x < minX) {
          blob.x = minX;
          blob.vx = Math.abs(blob.vx);
        } else if (blob.x > maxX) {
          blob.x = maxX;
          blob.vx = -Math.abs(blob.vx);
        }

        if (blob.y < minY) {
          blob.y = minY;
          blob.vy = Math.abs(blob.vy);
        } else if (blob.y > maxY) {
          blob.y = maxY;
          blob.vy = -Math.abs(blob.vy);
        }

        const x = blob.x - blob.radius;
        const y = blob.y - blob.radius;
        if (blob.cache) {
          const pulse = 0.94 + Math.sin(time * 0.00016 + blob.pulsePhase) * 0.08;
          ctx.globalAlpha = blob.alpha * pulse;
          ctx.drawImage(blob.cache, x, y);
          ctx.globalAlpha = 1;
        }
      }

      const pointerActive = pointer.active && !isCoarsePointer;
      const pointerX = pointer.x * width;
      const pointerY = pointer.y * height;
      for (const star of stars) {
        const driftTime = time * 0.0003 * star.speed;
        const baseX = star.originX + Math.sin(driftTime + star.oscX) * star.driftRadius;
        const baseY = star.originY + Math.cos(driftTime + star.oscY) * star.driftRadius;

        star.baseX = baseX;
        star.baseY = baseY;

        const dx = pointerX - star.x;
        const dy = pointerY - star.y;
        const dist = Math.hypot(dx, dy);
        const influenceRadius = 180;

        if (pointerActive && dist < influenceRadius && star.layer <= 1) {
          const influence = (1 - dist / influenceRadius) * star.pointerWeight;
          star.x += dx * influence;
          star.y += dy * influence;
        } else {
          star.x += (star.baseX - star.x) * (0.018 + star.speed * 0.0025);
          star.y += (star.baseY - star.y) * (0.018 + star.speed * 0.0025);
        }

        const twinkle = prefersReducedMotion
          ? 1
          : 0.75 +
            Math.sin(time * (0.0032 + star.speed * 0.00025) + star.phase) * 0.28 +
            Math.sin(time * 0.0021 + star.twinkle) * 0.18;
        const alpha = Math.max(0.1, star.opacity * twinkle);
        const size = star.size * (0.85 + star.z * 0.6);

        ctx.beginPath();
        ctx.arc(star.x, star.y, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${alpha})`;
        ctx.fill();
      }

      animationFrame = window.requestAnimationFrame(render);
    };

    resize();
    if (!isCoarsePointer) {
      window.addEventListener("mousemove", onPointerMove, { passive: true });
      window.addEventListener("mouseleave", onPointerLeave, { passive: true });
    }
    document.addEventListener("visibilitychange", onVisibilityChange);
    lastTime = performance.now();
    animationFrame = window.requestAnimationFrame(render);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      if (resizeTimeout) clearTimeout(resizeTimeout);
      resizeObserver.disconnect();
      window.removeEventListener("mousemove", onPointerMove);
      window.removeEventListener("mouseleave", onPointerLeave);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [accentColor]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        maxWidth: "100%",
        display: "block",
        pointerEvents: "none",
      }}
    />
  );
}