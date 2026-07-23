"use client";

import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import HeroCard from "@/components/three/HeroCard";
import SocialLinks from "@/components/ui/SocialLinks";
import { scrollToSection } from "@/lib/scroll";

const roles = ["Full Stack Developer", "AI Enthusiast", "MERN Developer"];

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
    ease: "steps(1)"
  });

  return timeline;
}

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const roleRef = useRef<HTMLDivElement>(null);
  const roleTextRef = useRef<HTMLSpanElement>(null);
  const cursorRef = useRef<HTMLSpanElement>(null);
  const greetingRef = useRef<HTMLHeadingElement>(null);
  const buttonWrapperRef = useRef<HTMLDivElement>(null);
  const cardContainerRef = useRef<HTMLDivElement>(null);
  const typewriterTimelineRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!prefersReducedMotion) {
      gsap.set([roleRef.current, buttonWrapperRef.current], { opacity: 0, y: 15 });
      gsap.set(cardContainerRef.current, { opacity: 0, scale: 0.92, y: 20 });

      const greetingElement = greetingRef.current;
      if (greetingElement) {
        const text = greetingElement.textContent || "";
        const words = text.split(" ");
        greetingElement.innerHTML = "";

        words.forEach((word) => {
          const span = document.createElement("span");
          span.innerText = word + " ";
          span.style.display = "inline-block";
          span.style.opacity = "0";
          span.style.transform = "translateY(12px)";
          greetingElement.appendChild(span);
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

        const wordSpans = greetingRef.current?.querySelectorAll("span");
        if (wordSpans && wordSpans.length > 0) {
          tl.to(
            wordSpans,
            {
              opacity: 1,
              y: 0,
              duration: 0.45,
              stagger: 0.03,
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

  const handleContactClick = () => {
    scrollToSection("connect", { behavior: "smooth" });
  };

  return (
    <section
      id="hero"
      ref={containerRef}
      className="min-h-[85vh] flex flex-col justify-center p-8 md:p-16 select-none"
    >
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center w-full">
        <div className="md:col-span-7 flex flex-col justify-center gap-6 order-2 md:order-1">
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.35em] text-accent">
            <span className="inline-block h-px w-6 bg-accent" />
            <span>— Hello, World!</span>
          </div>

          <div className="max-w-2xl">
            <h1
              ref={greetingRef}
              className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-foreground leading-[0.92]"
            >
              <span className="block">Lingkon</span>
              <span className="block text-accent">Dash</span>
            </h1>

            <div
              ref={roleRef}
              className="mt-5 inline-flex flex-wrap items-center gap-3 text-sm md:text-base text-foreground/80"
            >
              <span className="inline-flex h-2.5 w-2.5 rounded-full bg-accent shrink-0" />
              <span ref={roleTextRef} className="font-semibold text-foreground"></span>
              <span ref={cursorRef} className="font-bold text-accent">|</span>
            </div>
          </div>

          <p className="max-w-2xl text-base md:text-lg leading-8 text-foreground/80 font-sans">
            Hi, I'm Lingkon Dash — a passionate Full Stack Developer building scalable, user-friendly web applications with clean, maintainable code.
          </p>

          <div ref={buttonWrapperRef} className="flex flex-wrap items-center gap-3">
            <button
              disabled
              data-cursor="button"
              className="inline-flex items-center justify-center rounded-full px-6 py-3 bg-accent text-accent-foreground font-bold uppercase tracking-wider opacity-85 cursor-not-allowed select-none transition-colors"
            >
              Resume Coming Soon
            </button>
            <button
              type="button"
              data-cursor="button"
              onClick={handleContactClick}
              className="inline-flex items-center justify-center rounded-full px-6 py-3 border border-accent text-accent font-semibold tracking-wide transition-colors hover:bg-accent/10"
            >
              Contact Me
            </button>
          </div>

          <div className="mt-8 flex flex-col gap-4">
            <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.4em] text-muted font-semibold">
              <span className="h-px flex-1 bg-border" />
              <span>find me</span>
            </div>
            <SocialLinks className="flex-wrap gap-3" />
          </div>
        </div>

        <div
          ref={cardContainerRef}
          className="md:col-span-5 flex justify-center items-center order-1 md:order-2"
        >
          <div className="relative w-full max-w-[420px] mx-auto">
            <div className="absolute right-0 top-0 translate-x-1/4 -translate-y-1/4 rounded-full border border-accent/20 bg-accent/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.32em] text-accent shadow-sm">
              Available for Work
            </div>
            <div className="rounded-[2rem] border border-border/70 bg-background-elevated/70 p-4 shadow-[0_20px_80px_rgba(0,0,0,0.08)]">
              <HeroCard />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
