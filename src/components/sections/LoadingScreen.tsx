"use client";

import React from "react";

interface LoadingScreenProps {
  onComplete?: () => void;
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  void onComplete;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-background/95 px-6 text-foreground backdrop-blur-sm">
      <div className="flex w-full max-w-sm flex-col items-center gap-4 rounded-2xl border border-white/10 bg-background/70 p-6 shadow-2xl shadow-black/30">
        <div className="text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-muted">
            Loading portfolio
          </p>
          <p className="mt-2 text-sm text-muted/80">
            Preparing the experience for you.
          </p>
        </div>

        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-1/2 animate-pulse rounded-full bg-foreground/80" />
        </div>
      </div>
    </div>
  );
}
