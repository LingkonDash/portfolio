"use client";

import React from "react";
import StarField from "@/components/three/StarField";

export default function StarBackground() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100vw",
        height: "100vh",
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
