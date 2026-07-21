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
  opacity: number;
  twinkle: number;
  phase: number;
  z: number;
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
  if (area > 1_200_000) return 260;
  if (area > 700_000) return 200;
  return 140;
}

export default function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const blobState = useRef<NebulaBlob[]>([]);
  const cloudTimeline = useRef<gsap.core.Tween | null>(null);
  const { theme } = useTheme();

  const resolvedTheme = theme ?? "void";
  const accentColor = THEME_STAR_COLORS[resolvedTheme] ?? THEME_STAR_COLORS.void;

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
        const layer = index % 3;
        const baseSize = [1.2, 1.8, 2.6][layer];
        const baseOpacity = [0.7, 0.5, 0.28][layer];
        const x = margin + Math.random() * (width - margin * 2);
        const y = margin + Math.random() * (height - margin * 2);
        const z = 0.55 + Math.random() * 0.45;
        return {
          x,
          y,
          originX: x,
          originY: y,
          baseX: x,
          baseY: y,
          size: baseSize * z,
          opacity: baseOpacity,
          twinkle: Math.random() * Math.PI * 2,
          phase: Math.random() * Math.PI * 2,
          z,
          oscX: Math.random() * Math.PI * 2,
          oscY: Math.random() * Math.PI * 2,
          driftRadius: 10 + Math.random() * 24,
        };
      });
    };

    const buildNebula = () => {
      const warm = "#f2c28b";
      const cool = "#8bdcff";
      const colors = [accentColor, warm, cool];
      const blobs: NebulaBlob[] = Array.from({ length: 3 }, (_, index) => {
        const baseX = width * (0.18 + index * 0.25);
        const baseY = height * (0.18 + index * 0.16);
        const radius = width * (0.18 + index * 0.05);
        return {
          baseX,
          baseY,
          x: baseX,
          y: baseY,
          radius,
          accent: colors[index],
          alpha: 0.18 + index * 0.07,
        };
      });

      blobState.current = blobs;
      cloudTimeline.current?.kill();
      cloudTimeline.current = gsap.to(blobState.current, {
        duration: 22,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        stagger: { each: 6, from: "center", amount: 14 },
        x: (idx) => `+=${[32, -28, 34][idx % 3]}`,
        y: (idx) => `+=${[-22, 18, -24][idx % 3]}`,
      });
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

      const gradient = ctx.createRadialGradient(width * 0.5, height * 0.2, 0, width * 0.5, height * 0.2, width * 0.8);
      gradient.addColorStop(0, `${accentColor}20`);
      gradient.addColorStop(0.35, "rgba(3, 5, 10, 0.72)");
      gradient.addColorStop(1, "rgba(2, 3, 8, 1)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      for (const blob of blobState.current) {
        const x = blob.x;
        const y = blob.y;
        const radius = blob.radius;
        const nebula = ctx.createRadialGradient(x, y, 0, x, y, radius);
        nebula.addColorStop(0, `${blob.accent}${Math.round(blob.alpha * 255).toString(16).padStart(2, "0")}`);
        nebula.addColorStop(0.4, `${blob.accent}16`);
        nebula.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = nebula;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      const pointerX = pointer.x * width;
      const pointerY = pointer.y * height;
      for (const star of stars) {
        const baseX = star.originX + Math.sin(time * 0.00024 + star.oscX) * star.driftRadius;
        const baseY = star.originY + Math.cos(time * 0.00026 + star.oscY) * star.driftRadius;

        star.baseX = baseX;
        star.baseY = baseY;

        const dx = pointerX - star.x;
        const dy = pointerY - star.y;
        const dist = Math.hypot(dx, dy);
        const influenceRadius = 160;

        if (pointer.active && dist < influenceRadius) {
          const influence = (1 - dist / influenceRadius) * 0.24;
          star.x += dx * influence;
          star.y += dy * influence;
        } else {
          star.x += (star.baseX - star.x) * 0.018;
          star.y += (star.baseY - star.y) * 0.018;
        }

        const twinkle = 0.75 + Math.sin(time * 0.0018 + star.phase) * 0.28 + Math.sin(time * 0.0012 + star.twinkle) * 0.18;
        const alpha = Math.max(0.12, star.opacity * twinkle);
        const size = star.size * (0.55 + star.z * 0.75);

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
      cloudTimeline.current?.kill();
      cloudTimeline.current = null;
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
