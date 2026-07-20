"use client";

/**
 * StarField.tsx
 * R3F inner scene: star particles rendered via drei <Points>/<PointMaterial>.
 *
 * Performance tiers (particle count):
 *  - HIGH  (hardwareConcurrency >= 8)  → 2400 particles
 *  - MID   (hardwareConcurrency >= 4)  → 1400 particles
 *  - LOW   (<4 cores OR FPS sample < 30 after mount) → ~40% → 960 particles
 *
 * Why these thresholds?
 *  - 8 cores: typical modern desktop/laptop — can comfortably handle 2 k+ points at 60 fps.
 *  - 4 cores: mid-range device — 1400 points keeps overhead around 1–2 ms/frame.
 *  - <4 cores: budget/mobile — drop to ~960 to stay well within a 16 ms frame budget.
 *  - FPS sample after mount: catches GPU-constrained devices regardless of CPU count.
 */

import React, { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";
import { useTheme } from "next-themes";
import { useLenis } from "@/hooks/useLenis";

// ─── Theme → star color map ────────────────────────────────────────────────────
// We derive star colour from the theme but dim it heavily so it never competes
// with foreground content. Using the accent hue at very low opacity (set on material).
const THEME_STAR_COLORS: Record<string, string> = {
  void: "#4dd8ff",      // cyan
  nebula: "#b565f5",    // violet
  solstice: "#ff8a3d",  // warm orange
  aurora: "#4dffb8",    // green
  eclipse: "#d9d9e0",   // near-white silver
};

// ─── Geometry helpers ──────────────────────────────────────────────────────────

/** Uniform distribution inside a slightly flattened sphere. */
function generateStarPositions(count: number, spread: number): Float32Array {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    let x: number, y: number, z: number;
    do {
      x = (Math.random() * 2 - 1) * spread;
      y = (Math.random() * 2 - 1) * spread;
      z = (Math.random() * 2 - 1) * (spread * 0.6);
    } while (x * x + y * y + z * z > spread * spread);
    positions[i * 3]     = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
  }
  return positions;
}

// ─── Particle count ────────────────────────────────────────────────────────────

function getInitialParticleCount(): number {
  if (typeof navigator === "undefined") return 1400;
  const cores = navigator.hardwareConcurrency ?? 4;
  if (cores >= 8) return 2400;
  if (cores >= 4) return 1400;
  return 960;
}

// ─── Shared cursor NDC (module singleton) ─────────────────────────────────────
// CustomCursor already tracks mouse via its own GSAP quickTo listener.
// Instead of a second listener, we share one module-level object updated here.
// Phase 6 can redirect this from Lenis pointer data if needed.
const cursorNDC = { x: 0, y: 0 };

if (typeof window !== "undefined") {
  window.addEventListener(
    "mousemove",
    (e: MouseEvent) => {
      cursorNDC.x =  (e.clientX / window.innerWidth)  * 2 - 1;
      cursorNDC.y = -(e.clientY / window.innerHeight) * 2 + 1;
    },
    { passive: true }
  );
}

// ─── Shared scroll state ──────────────────────────────────────────────────────
// Phase 5: was a module-level singleton updated by window.addEventListener('scroll').
// Phase 6: now populated by useLenis() inside the component (see below), which
// fires with the smooth-interpolated Lenis scroll position instead of raw scrollY.
// The object stays module-level so useFrame (which can't use hooks) can read it.
const scrollState = { progress: 0 };

// ─── StarField component ───────────────────────────────────────────────────────

export default function StarField() {
  const { theme } = useTheme();
  const { camera } = useThree();

  const prefersReducedMotion = useMemo(
    () =>
      typeof window !== "undefined"
        ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
        : false,
    []
  );

  const particleCount = useMemo(() => getInitialParticleCount(), []);

  const SPREAD = 6;

  // Original (rest) positions — never mutated after init
  const originalPositions = useMemo(
    () => generateStarPositions(particleCount, SPREAD),
    [particleCount]
  );

  // Live positions — mutated per-frame for cursor gravity, then passed to drei
  const livePositions = useMemo(
    () => new Float32Array(originalPositions),
    [originalPositions]
  );

  const pointsRef   = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.PointsMaterial>(null);
  const groupRef    = useRef<THREE.Group>(null);

  // FPS downgrade state
  const fpsCheck = useRef({ frames: 0, elapsed: 0, done: false });

  // Star colour derived from active theme
  const resolvedTheme = theme ?? "void";
  const starColor = THEME_STAR_COLORS[resolvedTheme] ?? THEME_STAR_COLORS.void;

  // Sync material color on theme change
  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.color.set(starColor);
    }
  }, [starColor]);

  // ── Lenis scroll subscription ───────────────────────────────────────────────
  // useLenis fires with the Lenis instance on every smooth-scroll tick, giving us
  // the interpolated progress (0..1) rather than the raw scrollY jump from
  // window.addEventListener('scroll'). This makes the star parallax feel buttery
  // smooth instead of stepping in discrete scroll events.
  //
  // Fallback: if Lenis hasn't initialised yet (e.g. SSR or context missing),
  // scrollState.progress stays 0 — stars simply don't drift until Lenis is ready.
  useLenis((lenis) => {
    scrollState.progress = lenis.progress; // Lenis.progress is already 0..1
  });

  // ── Per-frame loop ──────────────────────────────────────────────────────────
  useFrame((state, delta) => {
    const pts = pointsRef.current;
    if (!pts) return;

    const posAttr = pts.geometry.attributes.position as THREE.BufferAttribute;
    const time    = state.clock.getElapsedTime();

    // ── FPS downgrade check (first ~2 s or 60 frames) ──────────────────────
    const fc = fpsCheck.current;
    if (!fc.done) {
      fc.frames++;
      fc.elapsed += delta;
      if (fc.frames >= 60 || fc.elapsed >= 2) {
        const avgFps = fc.frames / fc.elapsed;
        // If average FPS < 30, hide every other particle by pushing it behind the clip plane.
        if (avgFps < 30) {
          for (let i = 1; i < particleCount; i += 2) {
            livePositions[i * 3 + 2] = -9999;
          }
          posAttr.needsUpdate = true;
        }
        fc.done = true;
      }
    }

    // ── Global opacity twinkle (cheap: single sin-wave, not per-particle) ──
    // prefers-reduced-motion: skip all animation, leave opacity at rest value.
    if (!prefersReducedMotion && materialRef.current) {
      const wave =
        Math.sin(time * 0.6) * 0.08 +
        Math.sin(time * 1.1 + 0.5) * 0.04;
      materialRef.current.opacity = Math.max(0.12, Math.min(0.45, 0.28 + wave));
    }

    // ── Cursor gravity ──────────────────────────────────────────────────────
    const GRAVITY_RADIUS    = 1.6;
    const GRAVITY_RADIUS_SQ = GRAVITY_RADIUS * GRAVITY_RADIUS;
    // prefers-reduced-motion: disable cursor bending per spec.
    const GRAVITY_STR = prefersReducedMotion ? 0 : 0.22;
    const LERP_BACK   = 0.04; // fraction per frame toward rest position

    // Unproject cursor from NDC to world space (at Z=0 depth)
    const cursorWorld = new THREE.Vector3(cursorNDC.x, cursorNDC.y, 0).unproject(camera);

    let dirty = false;
    for (let i = 0; i < particleCount; i++) {
      const ox = originalPositions[i * 3];
      const oy = originalPositions[i * 3 + 1];
      const oz = originalPositions[i * 3 + 2];

      // Skip particles hidden by FPS downgrade
      if (livePositions[i * 3 + 2] === -9999) continue;

      let lx = livePositions[i * 3];
      let ly = livePositions[i * 3 + 1];
      let lz = livePositions[i * 3 + 2];

      // Spatial check first — skips particles outside cursor radius cheaply
      if (GRAVITY_STR > 0) {
        const dx = lx - cursorWorld.x;
        const dy = ly - cursorWorld.y;
        const dSq = dx * dx + dy * dy;
        if (dSq < GRAVITY_RADIUS_SQ) {
          // Pull toward cursor, falling off with distance
          const influence = (1 - dSq / GRAVITY_RADIUS_SQ) * GRAVITY_STR;
          lx += (cursorWorld.x - lx) * influence;
          ly += (cursorWorld.y - ly) * influence;
        }
      }

      // Always lerp back to rest position
      const nlx = lx + (ox - lx) * LERP_BACK;
      const nly = ly + (oy - ly) * LERP_BACK;
      const nlz = lz + (oz - lz) * LERP_BACK;

      if (nlx !== livePositions[i * 3] || nly !== livePositions[i * 3 + 1] || nlz !== livePositions[i * 3 + 2]) {
        livePositions[i * 3]     = nlx;
        livePositions[i * 3 + 1] = nly;
        livePositions[i * 3 + 2] = nlz;
        dirty = true;
      }
    }
    if (dirty) posAttr.needsUpdate = true;

    // ── Scroll-driven parallax ──────────────────────────────────────────────
    // Rotates the group rather than moving the camera — no new geometry rendered.
    // Max ±0.35 rad X, ±0.18 rad Y across full scroll range: barely perceptible
    // but gives a convincing "drifting through space" feel.
    if (groupRef.current) {
      const tx = scrollState.progress * 0.35;
      const ty = scrollState.progress * 0.18;
      groupRef.current.rotation.x += (tx - groupRef.current.rotation.x) * 0.08;
      groupRef.current.rotation.y += (ty - groupRef.current.rotation.y) * 0.08;
    }
  });

  return (
    <group ref={groupRef}>
      {/*
        drei <Points> + <PointMaterial>: the recommended approach for hundreds–
        thousands of point sprites in a single draw call.
        - positions: Float32Array fed directly into BufferGeometry
        - frustumCulled=false: stars fill viewport, no need to cull
        - AdditiveBlending: bright-on-dark layering, keeps stars visually calm
        - depthWrite=false: no z-fighting with background
      */}
      <Points
        ref={pointsRef}
        positions={livePositions}
        stride={3}
        frustumCulled={false}
      >
        <PointMaterial
          ref={materialRef as React.Ref<THREE.PointsMaterial>}
          transparent
          color={starColor}
          size={0.022}
          sizeAttenuation
          depthWrite={false}
          opacity={0.28}
          blending={THREE.AdditiveBlending}
        />
      </Points>
    </group>
  );
}
