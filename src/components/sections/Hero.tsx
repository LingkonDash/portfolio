// Hero.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import HeroCard from "@/components/three/HeroCard";
import SocialLinks from "@/components/ui/SocialLinks";
import { scrollToSection } from "@/lib/scroll";

const roles = ["Full Stack Developer", "AI Enthusiast", "MERN Developer", "Problem Solver"];

function buildTypewriterTimeline(
  roleTextRef: React.RefObject<HTMLSpanElement | null>,
  cursorRef: React.RefObject<HTMLSpanElement | null>
) {
  if (!roleTextRef.current || !cursorRef.current) return null;

  const timeline = gsap.timeline({ repeat: -1, repeatDelay: 0.8 });

  roles.forEach((role) => {
    const typeState = { count: 0 };
    const deleteState = { count: role.length };

    timeline.call(() => {
      if (roleTextRef.current) {
        roleTextRef.current.textContent = "";
      }
    });

    timeline.to(typeState, {
      count: role.length,
      duration: role.length * 0.06,
      ease: "none",
      onUpdate: () => {
        if (roleTextRef.current) {
          roleTextRef.current.textContent = role.slice(0, Math.round(typeState.count));
        }
      },
    });

    timeline.to({}, { duration: 0.8 });

    timeline.to(deleteState, {
      count: 0,
      duration: role.length * 0.04,
      ease: "none",
      onUpdate: () => {
        if (roleTextRef.current) {
          roleTextRef.current.textContent = role.slice(0, Math.round(deleteState.count));
        }
      },
    });

    timeline.to({}, { duration: 0.2 });
  });

  gsap.set(cursorRef.current, { opacity: 1 });
  gsap.to(cursorRef.current, {
    opacity: 0,
    duration: 0.6,
    repeat: -1,
    yoyo: true,
    ease: "steps(1)",
  });

  return timeline;
}

/* ------------------------------------------------------------------ */
/*  HUD / mission-control decorative pieces                           */
/* ------------------------------------------------------------------ */

/** Four corner brackets that "power on" once, framing the hero like a HUD viewport. */
function HUDCornerFrame() {
  const groupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      const paths = groupRef.current?.querySelectorAll("path");
      if (!paths || paths.length === 0) return;

      paths.forEach((p) => {
        const len = (p as SVGPathElement).getTotalLength();
        gsap.set(p, { strokeDasharray: len, strokeDashoffset: prefersReducedMotion ? 0 : len });
      });

      if (!prefersReducedMotion) {
        gsap.to(paths, {
          strokeDashoffset: 0,
          duration: 0.9,
          stagger: 0.08,
          delay: 0.2,
          ease: "power2.out",
        });
      }
    }, groupRef);

    return () => ctx.revert();
  }, []);

  const corner = "M1 9V1H9";

  return (
    <div
      ref={groupRef}
      className="pointer-events-none absolute inset-4 md:inset-10 hidden sm:block"
      aria-hidden="true"
    >
      <svg className="absolute left-0 top-0 h-4 w-4 text-accent/40" viewBox="0 0 10 10" fill="none">
        <path d={corner} stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <svg className="absolute right-0 top-0 h-4 w-4 rotate-90 text-accent/40" viewBox="0 0 10 10" fill="none">
        <path d={corner} stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <svg className="absolute bottom-0 right-0 h-4 w-4 rotate-180 text-accent/40" viewBox="0 0 10 10" fill="none">
        <path d={corner} stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <svg className="absolute bottom-0 left-0 h-4 w-4 -rotate-90 text-accent/40" viewBox="0 0 10 10" fill="none">
        <path d={corner} stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

/** Live local-time readout — a small piece of "mission control" telemetry. */
function MissionClock() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const update = () =>
      setTime(
        new Date().toLocaleTimeString("en-GB", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    update();
    const id = window.setInterval(update, 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="hidden items-center gap-2 font-mono text-[11px] tracking-widest text-foreground/50 md:flex">
      <span className="relative inline-flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-50" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
      </span>
      <span>online</span>
      <span className="text-foreground/25">·</span>
      <span suppressHydrationWarning>{time || "--:--:--"}</span>
    </div>
  );
}

/** Small "verified" transmission chip that sits beside the name. */
function IdentityChip() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 px-2.5 py-1 text-[10px] font-mono uppercase tracking-[0.25em] text-accent/80">
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
      </span>
      signal verified
    </span>
  );
}

/** Thin orbiting accent ring. */
function TagOrbit() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const ctx = gsap.context(() => {
      if (!ref.current) return;
      gsap.to(ref.current, { rotate: 360, duration: 9, repeat: -1, ease: "none" });
    });
    return () => ctx.revert();
  }, []);
  return (
    <div
      ref={ref}
      className="absolute -left-1.5 -top-1.5 h-5 w-5 rounded-full border border-dashed border-accent/50 pointer-events-none"
    />
  );
}

/** Four tiny corner brackets tuned with theme accent colors. */
function CornerBrackets() {
  return (
    <>
      <span className="pointer-events-none absolute -left-1 -top-1 h-2 w-2 border-l-2 border-t-2 border-accent opacity-0 transition-all duration-200 ease-out group-hover:opacity-100 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 group-focus-visible:opacity-100" />
      <span className="pointer-events-none absolute -right-1 -top-1 h-2 w-2 border-r-2 border-t-2 border-accent opacity-0 transition-all duration-200 ease-out group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-focus-visible:opacity-100" />
      <span className="pointer-events-none absolute -bottom-1 -left-1 h-2 w-2 border-b-2 border-l-2 border-accent opacity-0 transition-all duration-200 ease-out group-hover:opacity-100 group-hover:-translate-x-0.5 group-hover:translate-y-0.5 group-focus-visible:opacity-100" />
      <span className="pointer-events-none absolute -bottom-1 -right-1 h-2 w-2 border-b-2 border-r-2 border-accent opacity-0 transition-all duration-200 ease-out group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:translate-y-0.5 group-focus-visible:opacity-100" />
    </>
  );
}

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const roleRef = useRef<HTMLDivElement>(null);
  const roleTextRef = useRef<HTMLSpanElement>(null);
  const roleTrackRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLSpanElement>(null);
  const greetingRef = useRef<HTMLHeadingElement>(null);
  const dashRef = useRef<HTMLSpanElement>(null);
  const buttonWrapperRef = useRef<HTMLDivElement>(null);
  const cardContainerRef = useRef<HTMLDivElement>(null);
  const typewriterTimelineRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!prefersReducedMotion) {
      gsap.set([roleRef.current, buttonWrapperRef.current], { opacity: 0, y: 15 });
      gsap.set(cardContainerRef.current, { opacity: 0, scale: 0.92, y: 20 });

      const nameSpans = greetingRef.current?.children;
      if (nameSpans && nameSpans.length > 0) {
        gsap.set(nameSpans, {
          opacity: 0,
          y: 12,
          skewX: -6,
          filter: "blur(4px)",
        });
      }
    } else {
      if (roleTextRef.current) {
        roleTextRef.current.textContent = roles[0];
      }
      if (cursorRef.current) {
        gsap.set(cursorRef.current, { opacity: 1 });
      }
    }

    const entranceTimeout = window.setTimeout(() => {
      const tl = gsap.timeline();

      if (prefersReducedMotion) {
        tl.to([roleRef.current, greetingRef.current, buttonWrapperRef.current, cardContainerRef.current], {
          opacity: 1,
          duration: 0.3,
          stagger: 0.05,
        });
      } else {
        tl.to(roleRef.current, {
          opacity: 1,
          y: 0,
          duration: 0.55,
          ease: "power3.out",
        });

        const nameSpans = greetingRef.current?.children;
        if (nameSpans && nameSpans.length > 0) {
          tl.to(
            nameSpans,
            {
              opacity: 1,
              y: 0,
              skewX: 0,
              filter: "blur(0px)",
              duration: 0.5,
              stagger: 0.08,
              ease: "power2.out",
            },
            "-=0.38"
          );
        } else {
          tl.to(greetingRef.current, { opacity: 1, y: 0, duration: 0.5 }, "-=0.4");
        }

        tl.to(
          buttonWrapperRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.45,
            ease: "power3.out",
          },
          "-=0.35"
        );

        tl.to(
          cardContainerRef.current,
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.75,
            ease: "power4.out",
          },
          "-=0.45"
        );
      }

      if (!prefersReducedMotion && roleTextRef.current && cursorRef.current) {
        typewriterTimelineRef.current = buildTypewriterTimeline(roleTextRef, cursorRef);
      }
    }, 100);

    return () => {
      window.clearTimeout(entranceTimeout);
      if (typewriterTimelineRef.current) {
        typewriterTimelineRef.current.kill();
      }
    };
  }, []);

  // Periodic monochrome glitch effect
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion || !dashRef.current) return;

    const ctx = gsap.context(() => {
      const el = dashRef.current;
      if (!el) return;

      const glitch = () => {
        const tl = gsap.timeline({
          onComplete: () => gsap.delayedCall(gsap.utils.random(4, 8), glitch),
        });
        tl.to(el, { x: -2, duration: 0.04, ease: "none" })
          .to(el, { x: 2, duration: 0.04, ease: "none" })
          .to(el, { x: -1, duration: 0.04, ease: "none" })
          .to(el, { x: 0, duration: 0.04, ease: "none" })
          .set(el, {
            textShadow: "2px 0 0 var(--tw-shadow-color, currentColor), -2px 0 0 rgba(0,0,0,0.25)",
          })
          .to(el, { duration: 0.08, textShadow: "0px 0 0 transparent" });
      };

      gsap.delayedCall(gsap.utils.random(3, 6), glitch);
    });

    return () => ctx.revert();
  }, []);

  const handleContactClick = () => {
    scrollToSection("connect", { behavior: "smooth" });
  };

  const handleResumeClick = () => {
    window.open("/resume.pdf", "_blank", "noopener,noreferrer");
  };

  return (
    <section
      id="hero"
      ref={containerRef}
      className="relative min-h-[85vh] flex flex-col justify-center p-6 md:p-16 select-none"
    >
      <HUDCornerFrame />

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center w-full">
        <div className="md:col-span-7 flex flex-col justify-center gap-6 order-2 md:order-1">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="relative inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.35em] text-accent w-fit">
              <TagOrbit />
              <span className="inline-block h-px w-6 bg-accent" />
              <span className="text-accent/50">$</span>
              <span>echo &quot;Hello, World!&quot;</span>
            </div>
            <MissionClock />
          </div>

          <div className="max-w-2xl">
            <div className="mb-3 flex items-center gap-3">
              <IdentityChip />
            </div>
            <h1
              ref={greetingRef}
              className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-foreground leading-[0.92] flex flex-wrap items-center gap-x-4"
            >
              <span className="inline-block">Lingkon</span>
              <span ref={dashRef} className="relative inline-block text-accent">
                Dash
              </span>
            </h1>

            <div
              ref={roleRef}
              className="mt-5 inline-flex flex-wrap items-center gap-3 text-sm md:text-base text-foreground/80"
            >
              <span className="relative inline-flex h-2.5 w-2.5 shrink-0">
                <span className="absolute inline-flex h-full w-full rounded-full bg-accent opacity-60 animate-ping" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-accent" />
              </span>
              <div className="relative inline-flex items-center gap-2 rounded-md border border-border/70 px-3 py-1.5 font-mono">
                <span className="text-accent/60">$</span>
                <div ref={roleTrackRef} className="relative overflow-hidden">
                  <span ref={roleTextRef} className="font-semibold text-foreground"></span>
                  <span ref={cursorRef} className="font-bold text-accent">
                    ▌
                  </span>
                </div>
              </div>
            </div>
          </div>

          <p className="max-w-2xl text-base md:text-lg leading-8 text-foreground/80 font-sans">
            Hi, I&apos;m Lingkon Dash — a passionate Full Stack Developer building scalable, user-friendly web
            applications with clean, maintainable code.
          </p>

          <div ref={buttonWrapperRef} className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              data-cursor="button"
              onClick={handleResumeClick}
              className="group relative inline-flex items-center justify-center rounded-lg px-6 py-3 bg-accent text-accent-foreground font-mono text-xs uppercase font-bold tracking-widest select-none transition-all duration-200 hover:bg-accent/90 active:scale-[0.98]"
            >
              <CornerBrackets />
              View Resume
            </button>
            <button
              type="button"
              data-cursor="button"
              onClick={handleContactClick}
              className="group relative inline-flex items-center justify-center rounded-lg px-6 py-3 border border-accent text-accent font-mono text-xs uppercase font-bold tracking-widest transition-all duration-200 hover:border-accent hover:text-accent active:scale-[0.98]"
            >
              <CornerBrackets />
              Contact Me
            </button>
          </div>

          <div className="mt-8 flex flex-col gap-4">
            <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.4em] text-muted font-semibold">
              <span className="h-px flex-1 bg-border" />
              <span>comms.link</span>
              <span className="h-px flex-1 bg-border" />
            </div>
            <SocialLinks className="flex-wrap gap-3" />
          </div>
        </div>

        <div
          ref={cardContainerRef}
          className="relative md:col-span-5 flex justify-center items-center order-1 md:order-2"
        >
          <span className="absolute -top-6 left-1/2 hidden -translate-x-1/2 font-mono text-[10px] uppercase tracking-[0.3em] text-foreground/30 md:block">
            render.live
          </span>
          <HeroCard />
        </div>
      </div>
    </section>
  );
}
