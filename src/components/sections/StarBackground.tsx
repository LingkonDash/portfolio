"use client";

/**
 * StarBackground.tsx
 * Fixed-position full-viewport wrapper that mounts the R3F Canvas + StarField.
 *
 * Design constraints:
 *  - position: fixed, 100dvw × 100dvh — stays pinned regardless of scroll.
 *  - z-index: 0 — sits behind ALL page content (navbar, sections, cursor, loading).
 *  - pointer-events: none — the wrapper never intercepts clicks or hovers.
 *    Cursor position for star gravity is captured via a global mousemove listener
 *    in StarField.tsx, not via DOM hit-testing on this element.
 *  - The loading screen (z-index: 9999) renders on top of this canvas naturally.
 */

import React from "react";
import { Canvas } from "@react-three/fiber";
import StarField from "@/components/three/StarField";

export default function StarBackground() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        width: "100dvw",
        height: "100dvh",
        zIndex: 0,
        pointerEvents: "none",
        // Ensure it truly sits behind all content layers
        isolation: "isolate",
      }}
    >
      <Canvas
        // Orthographic-like shallow FOV keeps star depth feel without a large scene
        camera={{ position: [0, 0, 4], fov: 60, near: 0.1, far: 100 }}
        // dpr: limit to [1, 1.5] — no need for super-resolution on a background layer
        dpr={[1, 1.5]}
        // gl props: antialias off (not needed for points), alpha on for transparent bg
        gl={{
          antialias: false,
          alpha: true,
          powerPreference: "low-power",
        }}
        // frameloop: "always" for twinkle + cursor gravity animations
        frameloop="always"
        style={{ width: "100%", height: "100%", display: "block" }}
      >
        {/* No lights needed — PointMaterial is unlit */}
        <StarField />
      </Canvas>
    </div>
  );
}
