"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";
import LoadingScreen from "@/components/sections/LoadingScreen";

export default function RouteTransitionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isActive, setIsActive] = useState(true);
  const [progress, setProgress] = useState(0);
  const [transitionKind, setTransitionKind] = useState<"initial" | "route">("initial");
  const [routeReady, setRouteReady] = useState(true);
  const previousPathnameRef = useRef(pathname);
  const startedAtRef = useRef(0);
  const reducedMotionRef = useRef(false);

  const startTransition = (kind: "initial" | "route") => {
    setTransitionKind(kind);
    setIsActive(true);
    setProgress(0);
    setRouteReady(kind === "initial");
    startedAtRef.current = performance.now();

    const duration = kind === "initial" ? 1.6 + Math.random() * 0.3 : 0.6 + Math.random() * 0.25;
    const progressRef = { value: 0 };

    const segments = reducedMotionRef.current
      ? [{ value: 100, duration: duration * 0.85, ease: "power1.inOut" }]
      : [
          { value: 24, duration: duration * 0.25, ease: "power2.out" },
          { value: 74, duration: duration * 0.4, ease: "power2.inOut" },
          { value: 100, duration: duration * 0.35, ease: "power1.out" },
        ];

    const timeline = gsap.timeline({
      defaults: { ease: "power2.out" },
      onComplete: () => {
        setProgress(100);
      },
    });

    segments.forEach((segment) => {
      timeline.to(
        progressRef,
        {
          value: segment.value,
          duration: segment.duration,
          ease: segment.ease,
          onUpdate: () => {
            setProgress(Math.round(progressRef.value));
          },
        },
        ">-0.01"
      );
    });
  };

  useEffect(() => {
    reducedMotionRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    startTransition("initial");
  }, []);

  useEffect(() => {
    if (pathname === previousPathnameRef.current) return;

    previousPathnameRef.current = pathname;
    setRouteReady(false);
    startTransition("route");
  }, [pathname]);

  useEffect(() => {
    if (transitionKind === "route") {
      const frame = window.requestAnimationFrame(() => {
        setRouteReady(true);
      });
      return () => window.cancelAnimationFrame(frame);
    }

    setRouteReady(true);
    return undefined;
  }, [pathname, transitionKind]);

  useEffect(() => {
    if (!isActive || progress < 100) return;

    const elapsed = performance.now() - startedAtRef.current;
    const minimumDisplayMs = transitionKind === "initial" ? 220 : 140;
    const maxFallbackMs = 2500;
    const waitMs = Math.max(0, minimumDisplayMs - elapsed);
    const guardMs = Math.min(maxFallbackMs, Math.max(waitMs, 0));

    if (!routeReady && elapsed < maxFallbackMs) {
      return undefined;
    }

    const timeout = window.setTimeout(() => {
      setIsActive(false);
    }, guardMs);

    return () => window.clearTimeout(timeout);
  }, [isActive, progress, routeReady, transitionKind]);

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    if (isActive) {
      root.style.overflow = "hidden";
      body.style.overflow = "hidden";
      body.classList.add("loading-overlay-active");
    } else {
      root.style.overflow = "";
      body.style.overflow = "";
      body.classList.remove("loading-overlay-active");
    }

    return () => {
      root.style.overflow = "";
      body.style.overflow = "";
      body.classList.remove("loading-overlay-active");
    };
  }, [isActive]);

  const screenVariant = useMemo(() => ({
    active: isActive,
    progress,
    variant: transitionKind,
  }), [isActive, progress, transitionKind]);

  return (
    <>
      <LoadingScreen {...screenVariant} />
      {children}
    </>
  );
}
