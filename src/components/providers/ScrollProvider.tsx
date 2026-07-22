"use client";

import React, { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { restoreScrollPosition } from "@/lib/scroll";

// Register ScrollTrigger once (safe to call multiple times — GSAP is idempotent)
gsap.registerPlugin(ScrollTrigger);

interface ScrollProviderProps {
  children: React.ReactNode;
}

export default function ScrollProvider({ children }: ScrollProviderProps) {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const refreshAndRestore = () => {
      restoreScrollPosition();
      ScrollTrigger.refresh();
    };

    refreshAndRestore();

    const handleLoad = () => refreshAndRestore();
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        refreshAndRestore();
      }
    };

    window.addEventListener("load", handleLoad);
    window.addEventListener("pageshow", handlePageShow);

    const timer = window.setTimeout(refreshAndRestore, 0);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("load", handleLoad);
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, []);

  return <>{children}</>;
}
