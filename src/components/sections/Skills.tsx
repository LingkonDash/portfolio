"use client";

import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import {
  FileCode,
  Layout,
  Code,
  Globe,
  Server,
  Terminal,
  Database,
  ShieldCheck,
  TrendingUp,
  Zap,
  Settings,
} from "lucide-react";
import { Skill } from "@/types/data";

const lucideIcons: Record<string, React.ComponentType<{ size?: number | string }>> = {
  FileCode,
  Layout,
  Code,
  Globe,
  Server,
  Terminal,
  Database,
  ShieldCheck,
  TrendingUp,
  Zap,
  Settings,
};

const WHEEL_SCROLL_THRESHOLD = 48;
const TOUCH_SCROLL_THRESHOLD = 32;

export default function Skills({ skills }: { skills: Skill[] }) {
  const containerRef = useRef<HTMLElement | null>(null);
  const circleRef = useRef<HTMLDivElement | null>(null);
  const wheelRef = useRef<HTMLDivElement | null>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const [isFinePointer, setIsFinePointer] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const wheelAccumulatorRef = useRef(0);
  const touchAccumulatorRef = useRef(0);
  const touchStartYRef = useRef(0);

  useEffect(() => {
    const pointerMedia = window.matchMedia("(pointer: fine)");
    const motionMedia = window.matchMedia("(prefers-reduced-motion: reduce)");

    const updatePointer = (event: MediaQueryListEvent) => setIsFinePointer(event.matches);
    const updateMotion = (event: MediaQueryListEvent) => setPrefersReducedMotion(event.matches);

    setIsFinePointer(pointerMedia.matches);
    setPrefersReducedMotion(motionMedia.matches);

    pointerMedia.addEventListener("change", updatePointer);
    motionMedia.addEventListener("change", updateMotion);

    return () => {
      pointerMedia.removeEventListener("change", updatePointer);
      motionMedia.removeEventListener("change", updateMotion);
    };
  }, []);

  useEffect(() => {
    if (!isFinePointer || prefersReducedMotion || !circleRef.current || skills.length === 0) {
      return;
    }

    const circle = circleRef.current;
    const totalItems = skills.length;

    const normalizeIndex = (index: number) => {
      const wrapped = index % totalItems;
      return wrapped < 0 ? wrapped + totalItems : wrapped;
    };

    const handleWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) < 10) return;
      event.preventDefault();

      wheelAccumulatorRef.current += event.deltaY;
      if (wheelAccumulatorRef.current > WHEEL_SCROLL_THRESHOLD) {
        setActiveIdx((prev) => normalizeIndex(prev + 1));
        wheelAccumulatorRef.current = 0;
      } else if (wheelAccumulatorRef.current < -WHEEL_SCROLL_THRESHOLD) {
        setActiveIdx((prev) => normalizeIndex(prev - 1));
        wheelAccumulatorRef.current = 0;
      }
    };

    const handleTouchStart = (event: TouchEvent) => {
      if (event.touches.length !== 1) return;
      touchStartYRef.current = event.touches[0].clientY;
      touchAccumulatorRef.current = 0;
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (event.touches.length !== 1) return;

      const currentY = event.touches[0].clientY;
      const delta = touchStartYRef.current - currentY;
      touchStartYRef.current = currentY;
      touchAccumulatorRef.current += delta;

      if (Math.abs(delta) > 4) {
        event.preventDefault();
      }

      if (touchAccumulatorRef.current > TOUCH_SCROLL_THRESHOLD) {
        setActiveIdx((prev) => normalizeIndex(prev + 1));
        touchAccumulatorRef.current = 0;
      } else if (touchAccumulatorRef.current < -TOUCH_SCROLL_THRESHOLD) {
        setActiveIdx((prev) => normalizeIndex(prev - 1));
        touchAccumulatorRef.current = 0;
      }
    };

    circle.addEventListener("wheel", handleWheel, { passive: false });
    circle.addEventListener("touchstart", handleTouchStart, { passive: true });
    circle.addEventListener("touchmove", handleTouchMove, { passive: false });

    return () => {
      circle.removeEventListener("wheel", handleWheel);
      circle.removeEventListener("touchstart", handleTouchStart);
      circle.removeEventListener("touchmove", handleTouchMove);
    };
  }, [isFinePointer, prefersReducedMotion, skills.length]);

  const totalSkills = skills.length;
  const activeSkill = skills[activeIdx] || skills[0];
  const ActiveIcon = activeSkill ? lucideIcons[activeSkill.icon] || Code : Code;
  const stepAngle = totalSkills > 0 ? 360 / totalSkills : 0;

  useEffect(() => {
    if (!isFinePointer || prefersReducedMotion || !wheelRef.current || totalSkills === 0) return;
    const targetRotation = -activeIdx * stepAngle;
    gsap.to(wheelRef.current, {
      rotation: targetRotation,
      duration: 0.8,
      ease: "power3.out",
      overwrite: true,
      transformOrigin: "50% 50%",
    });
  }, [activeIdx, isFinePointer, prefersReducedMotion, stepAngle, totalSkills]);

  useEffect(() => {
    if (!isFinePointer || prefersReducedMotion || totalSkills === 0) return;

    const normalizeIndex = (index: number) => {
      const wrapped = index % totalSkills;
      return wrapped < 0 ? wrapped + totalSkills : wrapped;
    };

    const timeline = gsap.timeline({ repeat: -1, repeatDelay: 4 });
    timeline.to({}, { duration: 4 }).call(() => setActiveIdx((prev) => normalizeIndex(prev + 1)));

    return () => {
      timeline.kill();
    };
  }, [isFinePointer, prefersReducedMotion, totalSkills]);

  return (
    <section
      id="skills"
      ref={containerRef}
      className="py-16 md:py-24 border-t border-border/10 select-none overflow-hidden min-h-screen"
    >
      <div className="max-w-5xl mx-auto w-full px-4">
        <h2 className="text-2xl md:text-3xl font-black tracking-tight text-foreground mb-12 text-left">
          Skills & Technologies
        </h2>

        {isFinePointer && !prefersReducedMotion ? (
          <div className="relative overflow-hidden">
            <div className="sticky top-24 mx-auto w-full max-w-[860px]">
              <div
                ref={circleRef}
                className="relative mx-auto w-full max-w-[760px] aspect-square overflow-hidden rounded-[2rem] touch-none"
              >
                <div className="absolute inset-0 rounded-full border border-border/15 bg-background/10 backdrop-blur-3xl" />
                <div className="absolute inset-[2.25rem] rounded-full border border-border/20 opacity-30" />
                <div className="absolute inset-[3.5rem] rounded-full border border-accent/20 opacity-30" />
                <div className="absolute inset-[4.75rem] rounded-full border border-border/10 opacity-25" />

                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative z-10 w-full max-w-[380px] rounded-[2rem] border border-border/20 bg-background/10 backdrop-blur-[45px] p-8 text-center shadow-[0_20px_80px_rgba(0,0,0,0.08)]">
                    <div className="flex flex-col items-center justify-center gap-4">
                      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-accent/10 text-accent shadow-[0_0_28px_rgba(56,189,248,0.12)]">
                        <ActiveIcon size={36} />
                      </div>
                      <h3 className="text-3xl font-bold tracking-tight text-foreground">
                        {activeSkill?.name}
                      </h3>
                      <p className="text-sm md:text-base text-foreground/80 leading-relaxed font-sans">
                        {activeSkill?.description}
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  ref={wheelRef}
                  className="absolute inset-0 flex items-center justify-center"
                  style={{
                    transform: `translateZ(0)`,
                    willChange: "transform",
                  }}
                >
                  {skills.map((skill, index) => {
                    const angle = index * stepAngle;
                    const isActive = index === activeIdx;
                    const Icon = lucideIcons[skill.icon] || Code;

                    return (
                      <button
                        key={skill.id}
                        type="button"
                        onClick={() => setActiveIdx(index)}
                        aria-label={`Activate ${skill.name}`}
                        className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full transition-all duration-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                        style={{
                          transform: `rotate(${angle}deg) translateY(-38%) rotate(${-angle}deg)`,
                        }}
                      >
                        <span
                          className={`flex h-14 w-14 items-center justify-center rounded-full border border-border/20 transition-all duration-500 ${
                            isActive
                              ? "bg-accent/20 text-accent scale-110 shadow-[0_0_24px_rgba(56,189,248,0.18)]"
                              : "bg-background/60 text-muted hover:bg-accent/10 hover:text-foreground"
                          }`}
                        >
                          <Icon size={22} />
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-6 w-full max-w-xl mx-auto">
            {skills.map((skill) => {
              const Icon = lucideIcons[skill.icon] || Code;
              return (
                <div
                  key={skill.id}
                  className="mobile-skill-card bg-background-elevated/40 border border-border/40 p-5 rounded-2xl flex gap-4 items-start shadow-md"
                >
                  <div className="p-3 rounded-2xl bg-accent/10 text-accent shrink-0">
                    <Icon size={24} />
                  </div>
                  <div className="flex flex-col gap-2 text-left">
                    <h3 className="text-lg font-bold tracking-tight text-foreground">
                      {skill.name}
                    </h3>
                    <p className="text-sm text-foreground/80 leading-relaxed font-sans">
                      {skill.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
