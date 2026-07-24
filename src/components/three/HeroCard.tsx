"use client";

import Image from "next/image";
import React, { useRef } from "react";
import { useTiltCard } from "@/hooks/useTiltCard";

export default function HeroCard() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useTiltCard({
    containerRef,
    cardRef,
    glowRef,
    enableMobileFloat: true,
  });

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-[340px] aspect-[4/5] mx-auto flex items-center justify-center p-4 cursor-none"
      style={{ perspective: "1000px" }}
    >
      <div
        ref={cardRef}
        data-cursor="card"
        className="relative w-full h-full rounded-2xl bg-background-elevated/40 border border-border/50 overflow-hidden flex flex-col items-center justify-center shadow-2xl transition-colors duration-300"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Glow effect follower */}
        <div
          ref={glowRef}
          className="absolute -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-accent rounded-full pointer-events-none filter blur-2xl opacity-0 transition-opacity"
        />

        <div className="absolute inset-0">
          <Image
            src="/images/avatar.jpg"
            alt="Lingkon Dash"
            fill
            sizes="(max-width: 420px) 90vw, 420px"
            className="object-cover rounded-2xl pointer-events-none"
          />
        </div>

        {/* Abstract space wireframes */}
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none" />
      </div>
    </div>
  );
}
