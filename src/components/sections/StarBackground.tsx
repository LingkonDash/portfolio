"use client";

import React from "react";
import StarField from "@/components/three/StarField";

export default function StarBackground() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        // no width/height: 100vw/100vh — inset:0 already fills the real viewport
        // and avoids the scrollbar-inclusive vw/vh overflow bug
        zIndex: 0,
        pointerEvents: "none",
        overflow: "hidden",
        isolation: "isolate",
        background: "radial-gradient(circle at top, rgba(77, 216, 255, 0.12), transparent 42%)",
      }}
    >
      <StarField />
    </div>
  );
}