"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

type CursorVariant = "default" | "link" | "button" | "card" | "scroll-up" | "scroll-down";

export default function CustomCursor({ hidden = false }: { hidden?: boolean }) {
  const cursorRef = useRef<HTMLDivElement>(null);
  const orbitRef = useRef<SVGSVGElement>(null);
  const scrollDotRef = useRef<SVGCircleElement>(null);
  const scrollDotTweenRef = useRef<gsap.core.Tween | null>(null);
  const [interactionVariant, setInteractionVariant] = useState<CursorVariant>("default");
  const [scrollVariant, setScrollVariant] = useState<CursorVariant | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isFinePointer, setIsFinePointer] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollYRef = useRef(0);
  const scrollResetTimeoutRef = useRef<number | null>(null);

  const activeVariant = scrollVariant ?? interactionVariant;
  const isScrollActive = scrollVariant !== null;

  useEffect(() => {
    setMounted(true);
    const mediaQuery = window.matchMedia("(pointer: fine)");
    setIsFinePointer(mediaQuery.matches);

    const handleMediaChange = (event: MediaQueryListEvent) => {
      setIsFinePointer(event.matches);
    };

    mediaQuery.addEventListener("change", handleMediaChange);
    return () => {
      mediaQuery.removeEventListener("change", handleMediaChange);
    };
  }, []);

  useEffect(() => {
    if (!isFinePointer || !cursorRef.current) return;

    const xTo = gsap.quickTo(cursorRef.current, "x", { duration: 0.25, ease: "power3.out" });
    const yTo = gsap.quickTo(cursorRef.current, "y", { duration: 0.25, ease: "power3.out" });

    gsap.set(cursorRef.current, { x: -100, y: -100, opacity: 0 });

    const showCursor = () => {
      setIsVisible(true);
      gsap.to(cursorRef.current, { opacity: 1, duration: 0.12, ease: "power2.out" });
    };

    const hideCursor = () => {
      setIsVisible(false);
      gsap.to(cursorRef.current, { opacity: 0, duration: 0.12, ease: "power2.out" });
    };

    const onMouseMove = (event: MouseEvent) => {
      showCursor();
      xTo(event.clientX - 16);
      yTo(event.clientY - 16);
    };

    const onMouseOut = (event: MouseEvent) => {
      if (event.relatedTarget === null) {
        hideCursor();
      } else {
        showCursor();
      }
    };

    const onScroll = (event?: Event) => {
      const deltaY = (event as WheelEvent | undefined)?.deltaY;
      const nextDirection = typeof deltaY === "number" && deltaY !== 0
        ? deltaY > 0
          ? "scroll-down"
          : "scroll-up"
        : window.scrollY > lastScrollYRef.current
          ? "scroll-down"
          : "scroll-up";

      lastScrollYRef.current = window.scrollY;
      setScrollVariant(nextDirection);

      if (scrollResetTimeoutRef.current) {
        window.clearTimeout(scrollResetTimeoutRef.current);
      }

      scrollResetTimeoutRef.current = window.setTimeout(() => {
        setScrollVariant(null);
      }, 180);
    };

    showCursor();
    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("mouseenter", showCursor);
    window.addEventListener("blur", hideCursor);
    document.documentElement.addEventListener("mouseenter", showCursor);
    document.documentElement.addEventListener("mouseleave", hideCursor);
    document.addEventListener("mouseout", onMouseOut);
    window.addEventListener("wheel", onScroll, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("touchmove", onScroll, { passive: true });

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseenter", showCursor);
      window.removeEventListener("blur", hideCursor);
      document.documentElement.removeEventListener("mouseenter", showCursor);
      document.documentElement.removeEventListener("mouseleave", hideCursor);
      document.removeEventListener("mouseout", onMouseOut);
      window.removeEventListener("wheel", onScroll);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("touchmove", onScroll);
      if (scrollResetTimeoutRef.current) {
        window.clearTimeout(scrollResetTimeoutRef.current);
      }
    };
  }, [isFinePointer]);

  useEffect(() => {
    if (!isFinePointer) return;

    const onMouseOver = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const interactive = target.closest("[data-cursor]") as HTMLElement | null;

      if (interactive) {
        const type = interactive.getAttribute("data-cursor") as CursorVariant | null;
        setInteractionVariant(type === "link" || type === "button" || type === "card" ? type : "link");
      }
    };

    const onMouseOut = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const interactive = target.closest("[data-cursor]") as HTMLElement | null;
      if (interactive) {
        setInteractionVariant("default");
      }
    };

    const onMouseDown = () => {
      gsap.to(cursorRef.current, { scale: 0.65, duration: 0.1, ease: "power2.out" });
    };

    const onMouseUp = () => {
      const targetScale = activeVariant === "card"
        ? 1.8
        : activeVariant === "link" || activeVariant === "button"
          ? 1.3
          : activeVariant === "scroll-up" || activeVariant === "scroll-down"
            ? 1.15
            : 1;
      gsap.to(cursorRef.current, { scale: targetScale, duration: 0.2, ease: "power2.out" });
    };

    document.addEventListener("mouseover", onMouseOver);
    document.addEventListener("mouseout", onMouseOut);
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("mouseup", onMouseUp);

    return () => {
      document.removeEventListener("mouseover", onMouseOver);
      document.removeEventListener("mouseout", onMouseOut);
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("mouseup", onMouseUp);
    };
  }, [activeVariant, isFinePointer]);

  useEffect(() => {
    if (!cursorRef.current) return;

    if (activeVariant === "link" || activeVariant === "button") {
      gsap.to(cursorRef.current, {
        scale: 1.3,
        rotation: 0,
        duration: 0.3,
        ease: "power2.out",
      });
    } else if (activeVariant === "card") {
      gsap.to(cursorRef.current, {
        scale: 1.8,
        rotation: 0,
        duration: 0.3,
        ease: "power2.out",
      });
    } else if (activeVariant === "scroll-up" || activeVariant === "scroll-down") {
      gsap.to(cursorRef.current, {
        scale: 1.15,
        rotation: 0,
        duration: 0.25,
        ease: "power2.out",
      });
    } else {
      gsap.to(cursorRef.current, {
        scale: 1,
        rotation: 0,
        duration: 0.3,
        ease: "power2.out",
      });
    }
  }, [activeVariant]);

  // ── Scroll capsule dot: bounces toward the scroll direction while active,
  // resets to its resting position (opposite the direction of travel) once
  // scrolling stops. Same bounding box as the previous bar+arrow indicator
  // (22x26) — only the visual shape/motion changed.
  useEffect(() => {
    if (!scrollDotRef.current) return;

    scrollDotTweenRef.current?.kill();

    // Resting position for each state: dot sits near the "incoming" edge
    // and bounces toward the "outgoing" edge, mirroring a scroll-wheel
    // mouse icon. Down → dot travels top→bottom. Up → bottom→top.
    const restY = isScrollActive
      ? activeVariant === "scroll-down"
        ? 8
        : 18
      : 13;
    const travelY = isScrollActive
      ? activeVariant === "scroll-down"
        ? 18
        : 8
      : 13;

    if (isScrollActive) {
      gsap.set(scrollDotRef.current, { attr: { cy: restY } });
      scrollDotTweenRef.current = gsap.to(scrollDotRef.current, {
        attr: { cy: travelY },
        duration: 0.45,
        ease: "power1.inOut",
        repeat: -1,
        yoyo: true,
      });
    } else {
      scrollDotTweenRef.current = gsap.to(scrollDotRef.current, {
        attr: { cy: restY },
        duration: 0.25,
        ease: "power2.out",
      });
    }

    return () => {
      scrollDotTweenRef.current?.kill();
    };
  }, [isScrollActive, activeVariant]);

  useEffect(() => {
    if (!isFinePointer || !orbitRef.current) return;
    const spin = gsap.to(orbitRef.current, {
      rotate: 360,
      duration: 10,
      repeat: -1,
      ease: "none",
    });
    return () => {
      spin.kill();
    };
  }, [isFinePointer]);

  if (hidden || !mounted || !isFinePointer) return null;

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media (pointer: fine) {
              html, body, * {
                cursor: none !important;
              }
            }
          `,
        }}
      />

      <div
        ref={cursorRef}
        className={`fixed top-0 left-0 w-8 h-8 pointer-events-none z-[100000] mix-blend-screen transition-opacity duration-300 ${isVisible ? "opacity-100 visible" : "opacity-0 invisible"}`}
      >
        <svg
          ref={orbitRef}
          width="32"
          height="32"
          viewBox="0 0 32 32"
          fill="none"
          className="absolute inset-0"
        >
          <circle
            cx="16"
            cy="16"
            r="12"
            stroke="var(--color-accent)"
            strokeWidth="1"
            strokeDasharray="4 8"
            className="opacity-70"
          />
          <circle
            cx="16"
            cy="4"
            r="2"
            fill="var(--color-accent)"
            className="shadow-lg shadow-accent"
          />
        </svg>

        {!isScrollActive ? (
          <div
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-300 ${
              activeVariant === "card"
                ? "w-1.5 h-1.5 bg-accent/40"
                : activeVariant === "link" || activeVariant === "button"
                  ? "w-3 h-3 bg-accent"
                  : "w-2.5 h-2.5 bg-accent"
            }`}
            style={{
              boxShadow: `0 0 8px var(--color-accent)`,
            }}
          />
        ) : (
          // Scroll capsule — same 22x26 footprint as before, now a rounded
          // pill outline with a dot that bounces toward the scroll direction.
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{ width: 22, height: 26 }}
          >
            <svg width="22" height="26" viewBox="0 0 22 26" fill="none">
              <rect
                x="2"
                y="1"
                width="18"
                height="24"
                rx="9"
                stroke="var(--color-accent)"
                strokeWidth="1.5"
                fill="none"
                opacity="0.9"
              />
              <circle
                ref={scrollDotRef}
                cx="11"
                cy="13"
                r="2.4"
                fill="var(--color-accent)"
                style={{ filter: "drop-shadow(0 0 4px var(--color-accent))" }}
              />
            </svg>
          </div>
        )}
      </div>
    </>
  );
}