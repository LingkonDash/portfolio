"use client";

import { useEffect, useInsertionEffect } from "react";
import { scrollToSection } from "@/lib/scroll";

export default function InitialScrollReset() {
  useInsertionEffect(() => {
    if (typeof window === "undefined") return;

    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const hash = window.location.hash;
    if (!hash) return;

    const frame = window.requestAnimationFrame(() => {
      scrollToSection(hash, { behavior: "auto" });
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  return null;
}
