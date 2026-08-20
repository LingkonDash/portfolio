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
  vx: number;
  vy: number;
  radius: number;
  boundRadius: number;
  accent: string;
  alpha: number;
  pulsePhase: number;
  rotation: number;
  rotationSpeed: number;
  cache: HTMLCanvasElement | null;
  cacheSize: number;
  static: boolean;
};

type Spark = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
};

type Spaceship = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  heading: number;
  orbitAngle: number;
  enginePhase: number;
  blinkPhase: number;
  sparks: Spark[];
  cache: HTMLCanvasElement | null;
};

const THEME_STAR_COLORS: Record<string, string> = {
  void: "#4dd8ff",
  nebula: "#b565f5",
  solstice: "#ff8a3d",
  aurora: "#4dffb8",
  eclipse: "#d9d9e0",
};

const MOBILE_STATIC_BREAKPOINT = 768;

function getStarCount(width: number, height: number): number {
  const area = width * height;
  if (width < 480) return 70;
  if (width < 768) return 130;
  if (area > 1_200_000) return 320;
  if (area > 700_000) return 230;
  return 160;
}

function getBlobCount(width: number): number {
  if (width < 480) return 2;
  if (width < 768) return 3;
  return 4;
}

function getSafeDpr(width: number) {
  const raw = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
  const cap = width < 768 ? 1.5 : 2;
  return Math.min(raw, cap);
}

function lerpAngle(from: number, to: number, t: number): number {
  let diff = ((to - from + Math.PI) % (Math.PI * 2)) - Math.PI;
  if (diff < -Math.PI) diff += Math.PI * 2;
  return from + diff * t;
}

function buildShipCache(accentColor: string): HTMLCanvasElement {
  const w = 100;
  const h = 46;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  const cx = w / 2;
  const cy = h / 2;

  // Engine glow (rear, -x side)
  const glow = ctx.createRadialGradient(cx - 34, cy, 1, cx - 34, cy, 20);
  glow.addColorStop(0, `${accentColor}aa`);
  glow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.ellipse(cx - 34, cy, 20, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  // Swept-back wings
  ctx.fillStyle = "#3d4257";
  ctx.beginPath();
  ctx.moveTo(cx - 6, cy - 4);
  ctx.lineTo(cx - 30, cy - 18);
  ctx.lineTo(cx - 20, cy - 6);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx - 6, cy + 4);
  ctx.lineTo(cx - 30, cy + 18);
  ctx.lineTo(cx - 20, cy + 6);
  ctx.closePath();
  ctx.fill();

  // Tapered hull, nose pointing to +x
  const bodyGradient = ctx.createLinearGradient(cx, cy - 9, cx, cy + 9);
  bodyGradient.addColorStop(0, "#eef0f8");
  bodyGradient.addColorStop(0.5, "#9ba0ba");
  bodyGradient.addColorStop(1, "#4c5068");
  ctx.fillStyle = bodyGradient;
  ctx.beginPath();
  ctx.moveTo(cx + 38, cy);
  ctx.quadraticCurveTo(cx + 20, cy - 10, cx - 10, cy - 9);
  ctx.quadraticCurveTo(cx - 32, cy - 8, cx - 36, cy - 3);
  ctx.lineTo(cx - 36, cy + 3);
  ctx.quadraticCurveTo(cx - 32, cy + 8, cx - 10, cy + 9);
  ctx.quadraticCurveTo(cx + 20, cy + 10, cx + 38, cy);
  ctx.closePath();
  ctx.fill();

  // Panel seam
  ctx.strokeStyle = "rgba(20,22,34,0.35)";
  ctx.lineWidth = 0.75;
  ctx.beginPath();
  ctx.moveTo(cx - 6, cy - 7);
  ctx.lineTo(cx - 6, cy + 7);
  ctx.stroke();

  // Cockpit canopy
  const domeGradient = ctx.createRadialGradient(cx + 12, cy - 3, 0.5, cx + 10, cy, 9);
  domeGradient.addColorStop(0, "#ffffff");
  domeGradient.addColorStop(0.45, `${accentColor}dd`);
  domeGradient.addColorStop(1, `${accentColor}44`);
  ctx.fillStyle = domeGradient;
  ctx.beginPath();
  ctx.ellipse(cx + 10, cy, 9, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.4)";
  ctx.lineWidth = 0.75;
  ctx.stroke();

  // Top rim highlight
  ctx.strokeStyle = "rgba(255,255,255,0.3)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cx - 10, cy - 8.5);
  ctx.quadraticCurveTo(cx + 15, cy - 9, cx + 34, cy - 1);
  ctx.stroke();

  // Twin engine nozzles
  [cy - 5, cy + 5].forEach((ey) => {
    ctx.beginPath();
    ctx.fillStyle = "#20222e";
    ctx.ellipse(cx - 35, ey, 4, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.fillStyle = accentColor;
    ctx.ellipse(cx - 37, ey, 1.6, 1.6, 0, 0, Math.PI * 2);
    ctx.fill();
  });

  return canvas;
}

export default function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const blobState = useRef<NebulaBlob[]>([]);
  const shipState = useRef<Spaceship | null>(null);
  const { theme } = useTheme();

  const resolvedTheme = theme ?? "void";
  const accentColor =
    typeof window !== "undefined"
      ? getComputedStyle(document.documentElement).getPropertyValue("--color-accent").trim() ||
        (THEME_STAR_COLORS[resolvedTheme] ?? THEME_STAR_COLORS.void)
      : THEME_STAR_COLORS[resolvedTheme] ?? THEME_STAR_COLORS.void;

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

    const buildNebula = () => {
      const warm = "#f2c28b";
      const cool = "#8bdcff";
      const colors = [accentColor, warm, cool];
      const blobSizes = [0.18, 0.13, 0.1, 0.07];
      const blobAlphas = [0.04, 0.03, 0.025, 0.02];
      const count = getBlobCount(width);
      const minDim = Math.min(width, height);
      const isMobile = width < MOBILE_STATIC_BREAKPOINT;

      const columns = Math.max(1, Math.ceil(Math.sqrt(count)));
      const rows = Math.max(1, Math.ceil(count / columns));
      const cellW = width / columns;
      const cellH = height / rows;

      const blobs: NebulaBlob[] = Array.from({ length: count }, (_, index) => {
        let radius = Math.min(width * blobSizes[index % blobSizes.length], minDim * 0.25);
        radius *= 0.75 + Math.random() * 0.35;
        if (isMobile) {
          radius = Math.min(radius, Math.min(cellW, cellH) * 0.35);
        }

        const boundRadius = isMobile ? radius : radius * 1.5;

        let x: number;
        let y: number;
        let vx = 0;
        let vy = 0;

        if (isMobile) {
          const col = index % columns;
          const row = Math.floor(index / columns);
          const cellCenterX = cellW * (col + 0.5);
          const cellCenterY = cellH * (row + 0.5);
          x = Math.min(width - boundRadius, Math.max(boundRadius, cellCenterX));
          y = Math.min(height - boundRadius, Math.max(boundRadius, cellCenterY));
        } else {
          x = boundRadius + Math.random() * Math.max(1, width - boundRadius * 2);
          y = boundRadius + Math.random() * Math.max(1, height - boundRadius * 2);

          const maxSpeed = 0.015;
          const angle = Math.random() * Math.PI * 2;
          const speed = maxSpeed * (0.5 + Math.random() * 0.5);
          vx = Math.cos(angle) * speed;
          vy = Math.sin(angle) * speed;
        }

        const rotationSpeed = isMobile ? 0 : (Math.random() * 2 - 1) * 0.00015;

        return {
          x,
          y,
          vx,
          vy,
          radius,
          boundRadius,
          accent: colors[index % colors.length],
          alpha: blobAlphas[index % blobAlphas.length],
          pulsePhase: Math.random() * Math.PI * 2,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed,
          cache: null,
          cacheSize: 0,
          static: isMobile,
        };
      });

      blobState.current = blobs;
    };

    const buildSpaceship = () => {
      const shipWidth = Math.max(48, Math.min(85, width * 0.08));
      const shipHeight = shipWidth * (46 / 100);
      const halfW = shipWidth / 2;
      const halfH = shipHeight / 2;

      const x = halfW + Math.random() * Math.max(1, width - halfW * 2);
      const y = halfH + Math.random() * Math.max(1, height * 0.6 - halfH * 2) + height * 0.1;

      const speed = 0.11;
      const angle = Math.random() * Math.PI * 2;

      shipState.current = {
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        width: shipWidth,
        height: shipHeight,
        heading: angle,
        orbitAngle: 0,
        enginePhase: Math.random() * Math.PI * 2,
        blinkPhase: Math.random() * Math.PI * 2,
        sparks: [],
        cache: buildShipCache(accentColor),
      };
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
      buildSpaceship();
    };

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

      const dt = Math.min(48, time - (lastTime || time));
      lastTime = time;

      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "rgba(2, 3, 8, 1)";
      ctx.fillRect(0, 0, width, height);

      const isMobileScreen = width < MOBILE_STATIC_BREAKPOINT;

      let targetX = 0;
      let targetY = 0;
      let targetActive = false;

      if (isMobileScreen) {
        // Automated figure-8 mobile path
        const pathTime = time * 0.0006;
        targetX = width * 0.5 + Math.sin(pathTime) * (width * 0.35);
        targetY = height * 0.5 + Math.sin(pathTime * 2) * (height * 0.25);
        targetActive = true;

        // Render visible glowing waypoint target marker on mobile
        ctx.save();
        const glow = ctx.createRadialGradient(targetX, targetY, 1, targetX, targetY, 12);
        glow.addColorStop(0, `${accentColor}aa`);
        glow.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(targetX, targetY, 12, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = accentColor;
        ctx.beginPath();
        ctx.arc(targetX, targetY, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else {
        // Desktop mouse tracking
        targetX = pointer.x * width;
        targetY = pointer.y * height;
        targetActive = pointer.active && !isCoarsePointer;
      }

      // Render low-density nebula blobs
      const blobs = blobState.current;
      for (const blob of blobs) {
        if (!blob.cache) {
          const size = Math.ceil(blob.boundRadius * 2) + 4;
          const blobCanvas = document.createElement("canvas");
          const blobCtx = blobCanvas.getContext("2d");
          if (!blobCtx) continue;

          blobCanvas.width = size;
          blobCanvas.height = size;

          const center = size / 2;

          if (blob.static) {
            const gradient = blobCtx.createRadialGradient(center, center, 0, center, center, blob.radius);
            gradient.addColorStop(0, `${blob.accent}${Math.round(blob.alpha * 255).toString(16).padStart(2, "0")}`);
            gradient.addColorStop(0.45, `${blob.accent}10`);
            gradient.addColorStop(1, "rgba(255,255,255,0)");
            blobCtx.fillStyle = gradient;
            blobCtx.beginPath();
            blobCtx.arc(center, center, blob.radius, 0, Math.PI * 2);
            blobCtx.fill();
          } else {
            const clusterPoints = 4 + Math.floor(Math.random() * 2);
            blobCtx.globalCompositeOperation = "lighter";
            for (let i = 0; i < clusterPoints; i++) {
              const angle = (Math.PI * 2 * i) / clusterPoints + Math.random() * 0.6;
              const distFromCenter = blob.radius * (0.1 + Math.random() * 0.2);
              const px = center + Math.cos(angle) * distFromCenter;
              const py = center + Math.sin(angle) * distFromCenter;
              const pRadius = blob.radius * (0.4 + Math.random() * 0.3);
              const localAlpha = blob.alpha * (0.4 + Math.random() * 0.3);
              const g = blobCtx.createRadialGradient(px, py, 0, px, py, pRadius);
              g.addColorStop(0, `${blob.accent}${Math.round(localAlpha * 255).toString(16).padStart(2, "0")}`);
              g.addColorStop(0.4, `${blob.accent}08`);
              g.addColorStop(1, "rgba(255,255,255,0)");
              blobCtx.fillStyle = g;
              blobCtx.beginPath();
              blobCtx.arc(px, py, pRadius, 0, Math.PI * 2);
              blobCtx.fill();
            }
            blobCtx.globalCompositeOperation = "source-over";

            const blurred = document.createElement("canvas");
            blurred.width = size;
            blurred.height = size;
            const blurredCtx = blurred.getContext("2d");
            if (blurredCtx) {
              blurredCtx.filter = `blur(${Math.max(8, blob.radius * 0.12)}px)`;
              blurredCtx.drawImage(blobCanvas, 0, 0);
              blob.cache = blurred;
              blob.cacheSize = size;
              continue;
            }
          }

          blob.cache = blobCanvas;
          blob.cacheSize = size;
        }

        if (!blob.static) {
          blob.x += blob.vx * dt;
          blob.y += blob.vy * dt;
          blob.rotation += blob.rotationSpeed * dt;

          const minX = blob.boundRadius;
          const maxX = width - blob.boundRadius;
          const minY = blob.boundRadius;
          const maxY = height - blob.boundRadius;

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
        }

        if (blob.cache) {
          const pulse = 0.94 + Math.sin(time * 0.00016 + blob.pulsePhase) * 0.08;
          ctx.save();
          ctx.globalAlpha = pulse;
          ctx.translate(blob.x, blob.y);
          if (!blob.static) ctx.rotate(blob.rotation);
          ctx.drawImage(blob.cache, -blob.cacheSize / 2, -blob.cacheSize / 2);
          ctx.restore();
        }
      }

      // Ship behavior
      const ship = shipState.current;
      if (ship) {
        const moveSpeed = 0.12;
        const orbitRadius = 50;
        const orbitSpeed = 0.0012;
        const followRange = 400; // Track limit range

        const dx = targetX - ship.x;
        const dy = targetY - ship.y;
        const dist = Math.hypot(dx, dy);

        const inRange = targetActive && (isMobileScreen || dist <= followRange);

        if (inRange) {
          if (dist > orbitRadius + 5) {
            // Straight follow towards target
            const angle = Math.atan2(dy, dx);
            ship.vx = Math.cos(angle) * moveSpeed;
            ship.vy = Math.sin(angle) * moveSpeed;
            ship.x += ship.vx * dt;
            ship.y += ship.vy * dt;

            ship.heading = lerpAngle(ship.heading, angle, 0.1);
            ship.orbitAngle = Math.atan2(ship.y - targetY, ship.x - targetX);
          } else {
            // Satellite orbit around target
            ship.orbitAngle += orbitSpeed * dt;
            const orbitTargetX = targetX + Math.cos(ship.orbitAngle) * orbitRadius;
            const orbitTargetY = targetY + Math.sin(ship.orbitAngle) * orbitRadius;

            ship.x += (orbitTargetX - ship.x) * 0.1;
            ship.y += (orbitTargetY - ship.y) * 0.1;

            const tangentHeading = ship.orbitAngle + Math.PI / 2;
            ship.heading = lerpAngle(ship.heading, tangentHeading, 0.15);
            ship.vx = Math.cos(tangentHeading) * moveSpeed;
            ship.vy = Math.sin(tangentHeading) * moveSpeed;
          }
        } else {
          // Free floating cruise when out of range or pointer inactive
          ship.x += ship.vx * dt;
          ship.y += ship.vy * dt;

          const halfW = ship.width / 2;
          const halfH = ship.height / 2;
          if (ship.x < halfW) {
            ship.x = halfW;
            ship.vx = Math.abs(ship.vx);
          } else if (ship.x > width - halfW) {
            ship.x = width - halfW;
            ship.vx = -Math.abs(ship.vx);
          }

          if (ship.y < halfH) {
            ship.y = halfH;
            ship.vy = Math.abs(ship.vy);
          } else if (ship.y > height - halfH) {
            ship.y = height - halfH;
            ship.vy = -Math.abs(ship.vy);
          }

          const moveAngle = Math.atan2(ship.vy, ship.vx);
          ship.heading = lerpAngle(ship.heading, moveAngle, 0.08);
        }

        // Engine Sparks
        if (!prefersReducedMotion) {
          const engineOffset = ship.width * 0.42;
          const engineX = ship.x - Math.cos(ship.heading) * engineOffset;
          const engineY = ship.y - Math.sin(ship.heading) * engineOffset;
          const sparkCount = 1 + Math.floor(Math.random() * 2);
          const sparkColors = ["#ffe9a8", "#ffffff", accentColor];
          for (let i = 0; i < sparkCount; i++) {
            const spread = (Math.random() - 0.5) * 0.8;
            const sparkAngle = ship.heading + Math.PI + spread;
            const sparkSpeed = 0.02 + Math.random() * 0.04;
            ship.sparks.push({
              x: engineX + (Math.random() - 0.5) * 4,
              y: engineY + (Math.random() - 0.5) * 4,
              vx: Math.cos(sparkAngle) * sparkSpeed,
              vy: Math.sin(sparkAngle) * sparkSpeed,
              life: 0,
              maxLife: 250 + Math.random() * 200,
              size: 0.6 + Math.random() * 1.2,
              color: sparkColors[Math.floor(Math.random() * sparkColors.length)],
            });
          }
        }

        ship.sparks = ship.sparks.filter((spark) => {
          spark.life += dt;
          if (spark.life >= spark.maxLife) return false;
          spark.x += spark.vx * dt;
          spark.y += spark.vy * dt;
          spark.vx *= 0.98;
          spark.vy *= 0.98;
          const t = 1 - spark.life / spark.maxLife;
          ctx.beginPath();
          ctx.globalAlpha = t;
          ctx.fillStyle = spark.color;
          ctx.arc(spark.x, spark.y, spark.size * t, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
          return true;
        });

        if (ship.cache) {
          ctx.save();
          ctx.translate(ship.x, ship.y + Math.sin(time * 0.0012 + ship.enginePhase) * 2);
          ctx.rotate(ship.heading);
          ctx.drawImage(ship.cache, -ship.width / 2, -ship.height / 2, ship.width, ship.height);
          ctx.restore();

          const blink = 0.35 + Math.max(0, Math.sin(time * 0.004 + ship.blinkPhase)) * 0.65;
          ctx.save();
          ctx.globalAlpha = blink;
          ctx.fillStyle = "#ff6b6b";
          const wingX =
            ship.x - Math.cos(ship.heading) * ship.width * 0.28 - Math.sin(ship.heading) * ship.height * 0.32;
          const wingY =
            ship.y - Math.sin(ship.heading) * ship.width * 0.28 + Math.cos(ship.heading) * ship.height * 0.32;
          ctx.beginPath();
          ctx.arc(wingX, wingY, 1.3, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      // Render Starfield
      for (const star of stars) {
        const driftTime = time * 0.0003 * star.speed;
        const baseX = star.originX + Math.sin(driftTime + star.oscX) * star.driftRadius;
        const baseY = star.originY + Math.cos(driftTime + star.oscY) * star.driftRadius;

        star.baseX = baseX;
        star.baseY = baseY;

        const starDx = targetX - star.x;
        const starDy = targetY - star.y;
        const starDist = Math.hypot(starDx, starDy);
        const influenceRadius = 180;

        if (targetActive && starDist < influenceRadius && star.layer <= 1) {
          const influence = (1 - starDist / influenceRadius) * star.pointerWeight;
          star.x += starDx * influence;
          star.y += starDy * influence;
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