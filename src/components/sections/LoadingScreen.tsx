"use client";

import React, { useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { useProgress } from "@react-three/drei";
import { gsap } from "gsap";
import LoadingLogo from "../three/LoadingLogo";

interface LoadingScreenProps {
  onComplete: () => void;
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const { progress } = useProgress();
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check for user's motion preference
    const prefersReducedMotion =
      typeof window !== "undefined"
        ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
        : false;

    // Once loading hits 100%, trigger the transition
    if (progress === 100) {
      const tl = gsap.timeline({
        onComplete: onComplete,
      });

      if (prefersReducedMotion) {
        tl.to(containerRef.current, {
          opacity: 0,
          duration: 0.8,
          ease: "power2.out",
        });
      } else {
        // Fly-through: scale up the 3D canvas while fading it out
        tl.to(
          counterRef.current,
          {
            opacity: 0,
            y: 20,
            duration: 0.4,
            ease: "power2.in",
          },
          0
        );

        tl.to(
          canvasContainerRef.current,
          {
            scale: 8,
            opacity: 0,
            duration: 1.2,
            ease: "power3.inOut",
          },
          0
        );

        tl.to(
          containerRef.current,
          {
            opacity: 0,
            duration: 0.8,
            ease: "power2.out",
          },
          0.4
        );
      }
    }
  }, [progress, onComplete]);

  // Round the progress to avoid decimal values
  const displayPercent = Math.round(progress);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 w-screen h-screen bg-background z-[9999] flex flex-col justify-between p-8 md:p-12 overflow-hidden pointer-events-auto"
    >
      <div className="flex justify-between items-start w-full">
        <div className="text-[10px] font-semibold tracking-[0.2em] uppercase text-muted">
          Lingkon Dash — Portfolio System v1.0
        </div>
        <div className="text-[10px] font-semibold tracking-[0.2em] uppercase text-muted">
          Phase 3 — 3D Loader
        </div>
      </div>

      {/* 3D Canvas Area */}
      <div
        ref={canvasContainerRef}
        className="flex-1 w-full flex items-center justify-center relative scale-100 opacity-100"
      >
        <div className="w-[300px] h-[300px] md:w-[400px] md:h-[400px]">
          <Canvas camera={{ position: [0, 0, 4.5], fov: 45 }}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1.5} />
            <pointLight position={[-10, -10, -10]} intensity={0.5} />
            <LoadingLogo />
          </Canvas>
        </div>
      </div>

      {/* Progress Counter in bottom-right corner */}
      <div ref={counterRef} className="flex justify-end items-end w-full">
        <div className="text-right">
          <div className="text-4xl md:text-5xl font-mono font-bold text-foreground">
            {displayPercent}%
          </div>
          {/* Note: This progress will naturally scale with heavier 3D assets/textures in subsequent phases */}
          <div className="text-[10px] tracking-[0.25em] uppercase text-muted mt-1">
            Loading System Resources
          </div>
        </div>
      </div>
    </div>
  );
}
