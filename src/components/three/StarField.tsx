"use client";

import React, { useEffect, useMemo, useRef } from "react";
import { gsap } from "gsap";
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
  baseX: number;
  baseY: number;
  x: number;
  y: number;
  radius: number;
  accent: string;
  alpha: number;
  pulsePhase: number;
  isLarge: boolean;
  driftStartX: number;
  driftStartY: number;
  driftTargetX: number;
  driftTargetY: number;
  driftStartTime: number;
  driftDuration: number;
  cache: HTMLCanvasElement | null;
};

const THEME_STAR_COLORS: Record<string, string> = {
  void: "#4dd8ff",
  nebula: "#b565f5",
  solstice: "#ff8a3d",
  aurora: "#4dffb8",
  eclipse: "#d9d9e0",
};

function getStarCount(width: number): number {
  const area = width * (window.innerHeight || 1000);
  if (area > 1_200_000) return 320;
  if (area > 700_000) return 230;
  return 160;
}

export default function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const blobState = useRef<NebulaBlob[]>([]);
  const { theme } = useTheme();

  const resolvedTheme = theme ?? "void";
  const accentColor =
    typeof window !== "undefined"
      ? getComputedStyle(document.documentElement).getPropertyValue("--color-accent").trim() || (THEME_STAR_COLORS[resolvedTheme] ?? THEME_STAR_COLORS.void)
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

    let width = 0;
    let height = 0;
    let dpr = 1;
    let animationFrame = 0;
    let stars: Star[] = [];
    const pointer = { x: 0.5, y: 0.5, active: false };

    const buildStars = () => {
      const margin = Math.max(30, width * 0.03);
      const count = getStarCount(width);
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
          driftRadius: 14 + Math.random() * 18,
        };
      });
    };

    const initializeDrift = (blob: NebulaBlob, index: number, now: number) => {
      const targetX = blob.isLarge
        ? width * (0.08 + Math.random() * 0.84)
        : Math.min(width - blob.radius, Math.max(blob.radius, blob.x + (Math.random() * 2 - 1) * width * 0.14));
      const targetY = blob.isLarge
        ? height * (0.08 + Math.random() * 0.84)
        : Math.min(height - blob.radius, Math.max(blob.radius, blob.y + (Math.random() * 2 - 1) * height * 0.12));
      const duration = (blob.isLarge ? 12 + Math.random() * 10 : 10 + Math.random() * 8) * 1000;
      const delay = (0.6 + Math.random() * 2.0) * 1000;

      blob.driftStartX = blob.x;
      blob.driftStartY = blob.y;
      blob.driftTargetX = targetX;
      blob.driftTargetY = targetY;
      blob.driftStartTime = now + delay;
      blob.driftDuration = duration;
    };

    const buildNebula = () => {
      const warm = "#f2c28b";
      const cool = "#8bdcff";
      const colors = [accentColor, warm, cool];
      const blobSizes = [0.34, 0.24, 0.18, 0.12, 0.08];
      const blobAlphas = [0.40, 0.32, 0.28, 0.22, 0.18];
      const blobs: NebulaBlob[] = Array.from({ length: 5 }, (_, index) => {
        const baseX = width * (0.08 + index * 0.18 + Math.random() * 0.1);
        const baseY = height * (0.12 + (index % 2 ? 0.35 : 0.15) + Math.random() * 0.18);
        const radius = width * blobSizes[index];
        const alpha = blobAlphas[index];
        return {
          baseX,
          baseY,
          x: baseX,
          y: baseY,
          radius,
          accent: colors[index % colors.length],
          alpha,
          pulsePhase: Math.random() * Math.PI * 2,
          isLarge: index < 3,
          driftStartX: baseX,
          driftStartY: baseY,
          driftTargetX: baseX,
          driftTargetY: baseY,
          driftStartTime: 0,
          driftDuration: 0,
          cache: null,
        };
      });

      const now = performance.now();
      blobs.forEach((blob, index) => {
        initializeDrift(blob, index, now);
      });

      blobState.current = blobs;
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = window.devicePixelRatio || 1;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildStars();
      buildNebula();
    };

    const onPointerMove = (event: MouseEvent) => {
      pointer.active = true;
      pointer.x = event.clientX / Math.max(window.innerWidth, 1);
      pointer.y = event.clientY / Math.max(window.innerHeight, 1);
    };

    const onPointerLeave = () => {
      pointer.active = false;
    };

    const render = (time: number) => {
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

        const now = time;
        const driftElapsed = now - blob.driftStartTime;
        if (driftElapsed >= blob.driftDuration) {
          blob.x = blob.driftTargetX;
          blob.y = blob.driftTargetY;
          const index = blobState.current.indexOf(blob);
          if (index !== -1) {
            initializeDrift(blob, index, now);
          }
        } else if (driftElapsed > 0) {
          const progress = Math.min(1, driftElapsed / blob.driftDuration);
          const eased = 0.5 - 0.5 * Math.cos(Math.PI * progress);
          blob.x = blob.driftStartX + (blob.driftTargetX - blob.driftStartX) * eased;
          blob.y = blob.driftStartY + (blob.driftTargetY - blob.driftStartY) * eased;
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

        if (pointer.active && dist < influenceRadius && star.layer <= 1) {
          const influence = (1 - dist / influenceRadius) * star.pointerWeight;
          star.x += dx * influence;
          star.y += dy * influence;
        } else {
          star.x += (star.baseX - star.x) * (0.018 + star.speed * 0.0025);
          star.y += (star.baseY - star.y) * (0.018 + star.speed * 0.0025);
        }

        const twinkle =
          0.75 +
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
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onPointerMove);
    window.addEventListener("mouseleave", onPointerLeave);
    animationFrame = window.requestAnimationFrame(render);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onPointerMove);
      window.removeEventListener("mouseleave", onPointerLeave);
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
        display: "block",
        pointerEvents: "none",
      }}
    />
  );
}
