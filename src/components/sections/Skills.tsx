"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
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

const seedNumber = (input: string | number) => {
  const text = String(input);
  return Array.from(text).reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) >>> 0, 0);
};

const seededRandom = (seed: number) => {
  let value = seed >>> 0;
  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
};

export default function Skills({ skills }: { skills: Skill[] }) {
  const containerRef = useRef<HTMLElement | null>(null);
  const circleRef = useRef<HTMLDivElement | null>(null);
  const wheelRef = useRef<HTMLDivElement | null>(null);
  const orbitGlowRef = useRef<SVGCircleElement | null>(null);
  const auraRef = useRef<HTMLDivElement | null>(null);
  const iconRefs = useRef<(HTMLDivElement | null)[]>([]);
  const starRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [isFinePointer, setIsFinePointer] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(pointer: fine)").matches;
  });
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });
  const [circleSize, setCircleSize] = useState(0);
  const wheelAccumulatorRef = useRef(0);
  const touchAccumulatorRef = useRef(0);
  const touchStartYRef = useRef(0);

  useEffect(() => {
    const pointerMedia = window.matchMedia("(pointer: fine)");
    const motionMedia = window.matchMedia("(prefers-reduced-motion: reduce)");

    const updatePointer = (event: MediaQueryListEvent) => setIsFinePointer(event.matches);
    const updateMotion = (event: MediaQueryListEvent) => setPrefersReducedMotion(event.matches);

    pointerMedia.addEventListener("change", updatePointer);
    motionMedia.addEventListener("change", updateMotion);

    return () => {
      pointerMedia.removeEventListener("change", updatePointer);
      motionMedia.removeEventListener("change", updateMotion);
    };
  }, []);

  useEffect(() => {
    if (!circleRef.current) return;

    const updateSize = () => {
      const size = circleRef.current?.clientWidth ?? 0;
      setCircleSize((current) => (current === size ? current : size));
    };

    updateSize();

    const observer = new ResizeObserver(updateSize);
    observer.observe(circleRef.current);

    return () => {
      observer.disconnect();
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
  const ActiveIcon = activeSkill ? lucideIcons[activeSkill.iconFallback] || Code : Code;
  const stepAngle = totalSkills > 0 ? 360 / totalSkills : 0;
  const orbitBaseRadius = circleSize * 0.42; // px radius for icon placement and SVG ring geometry
  const orbitSvgSize = circleSize;
  const orbitCenter = orbitSvgSize / 2;
  const orbitRingRadius = Math.max(0, orbitBaseRadius);
  const orbitRingCircumference = 2 * Math.PI * orbitRingRadius;
  const orbitGlowDashLength = orbitRingCircumference * 0.18;
  const bucketedSize = Math.max(0, Math.round(circleSize / 10) * 10);
  const currentWheelRotation = -activeIdx * stepAngle;

  const iconOffsets = useMemo(
    () =>
      skills.map((skill, index) => {
        const base = seedNumber(`${skill.id}-${index}`);
        return {
          floatDuration: 3.2 + ((Math.sin((base + 2) * 12.9898 + 78.233) * 43758.5453 % 1) * 2.6),
          floatDelay: (Math.sin((base + 3) * 12.9898 + 78.233) * 43758.5453 % 1) * 1.8,
          floatX: (Math.sin((base + 4) * 12.9898 + 78.233) * 43758.5453 % 1) * 12 - 6,
          floatY: (Math.sin((base + 5) * 12.9898 + 78.233) * 43758.5453 % 1) * 12 - 6,
        };
      }),
    [skills]
  );

  const starParticles = useMemo(() => {
    const count = Math.min(24, Math.max(15, totalSkills * 2));
    return Array.from({ length: count }, (_, index) => {
      const seed = seedNumber(`star-${index}-${bucketedSize}`);
      const random = seededRandom(seed);
      const angle = random() * Math.PI * 2;
      const radius = Math.max(orbitBaseRadius * 0.18, orbitBaseRadius * (0.25 + random() * 0.55));
      return {
        left: orbitCenter + Math.cos(angle) * radius,
        top: orbitCenter + Math.sin(angle) * radius,
        size: 1 + Math.round(random() * 1),
        delay: random() * 3,
        duration: 2 + random() * 3,
        color: random() > 0.68 ? "var(--color-accent)" : "var(--color-foreground)",
      };
    });
  }, [orbitBaseRadius, orbitCenter, bucketedSize, totalSkills]);

  useEffect(() => {
    if (!isFinePointer || prefersReducedMotion || !wheelRef.current || totalSkills === 0) return;
    const targetRotation = -activeIdx * stepAngle;
    gsap.to(wheelRef.current, {
      rotation: targetRotation,
      duration: 1.2,
      ease: "power3.out",
      overwrite: true,
      transformOrigin: "50% 50%",
    });
  }, [activeIdx, isFinePointer, prefersReducedMotion, stepAngle, totalSkills]);

  useEffect(() => {
    if (!isFinePointer || prefersReducedMotion || totalSkills === 0) return;

    const tweens = iconRefs.current.map((icon, index) => {
      const offsets = iconOffsets[index];
      if (!icon || !offsets) return null;
      return gsap.to(icon, {
        x: offsets.floatX,
        y: offsets.floatY,
        duration: offsets.floatDuration,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        delay: offsets.floatDelay,
        overwrite: true,
      });
    });

    return () => {
      tweens.forEach((tween) => tween?.kill());
    };
  }, [iconOffsets, isFinePointer, prefersReducedMotion, totalSkills]);

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

  useEffect(() => {
    if (!isFinePointer || prefersReducedMotion || !auraRef.current) return;

    const auraTween = gsap.to(auraRef.current, {
      opacity: 0.35,
      scale: 1.08,
      duration: 4,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
    });

    return () => {
      auraTween.kill();
    };
  }, [isFinePointer, prefersReducedMotion]);

  useEffect(() => {
    if (!isFinePointer || prefersReducedMotion || !orbitGlowRef.current) return;

    const rotateRing = gsap.to(orbitGlowRef.current, {
      strokeDashoffset: -orbitRingCircumference,
      duration: 20,
      ease: "none",
      repeat: -1,
    });

    const glowPulse = gsap.to(orbitGlowRef.current, {
      opacity: 0.6,
      duration: 3,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
    });

    return () => {
      rotateRing.kill();
      glowPulse.kill();
    };
  }, [isFinePointer, prefersReducedMotion, orbitRingCircumference]);

  useEffect(() => {
    if (!isFinePointer || prefersReducedMotion || starParticles.length === 0) return;

    const tweens = starRefs.current.map((star, index) => {
      if (!star) return null;
      const particle = starParticles[index];
      return gsap.fromTo(
        star,
        { opacity: 0.2 },
        {
          opacity: 1,
          duration: particle.duration,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          delay: particle.delay,
          overwrite: true,
        }
      );
    });

    return () => {
      tweens.forEach((tween) => tween?.kill());
    };
  }, [starParticles, isFinePointer, prefersReducedMotion]);

  useEffect(() => {
    if (!isFinePointer || prefersReducedMotion || totalSkills === 0) return;

    iconRefs.current.forEach((icon, index) => {
      if (!icon) return;
      const isElevated = index === activeIdx || index === hoveredIdx;
      gsap.to(icon, {
        scale: isElevated ? 1.12 : 1,
        duration: 0.35,
        ease: "power2.out",
        overwrite: true,
      });
    });
  }, [activeIdx, hoveredIdx, isFinePointer, prefersReducedMotion, totalSkills]);

  return (
    <section
      id="skills"
      ref={containerRef}
      className="py-16 px-6 md:py-24 border-t border-border/10 select-none overflow-hidden"
    >
      <div className="max-w-7xl mx-auto w-full px-4">
        <h2 className="text-2xl md:text-3xl font-black tracking-tight text-foreground mb-12 text-left">
          Skills & Technologies
        </h2>

        {isFinePointer && !prefersReducedMotion ? (
          <div className="relative overflow-hidden">
            <div className="sticky top-24 mx-auto w-full max-w-215">
              <div
                ref={circleRef}
                className="relative mx-auto w-full max-w-190 aspect-square overflow-hidden rounded-4xl touch-none"
              >
                <div className="absolute inset-0 pointer-events-none z-0">
                  <div
                    ref={auraRef}
                    className="absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full"
                    style={{
                      background: "radial-gradient(circle, color-mix(in srgb, var(--color-accent) 40%, transparent) 0%, transparent 65%)",
                      filter: "blur(40px)",
                      opacity: 0.2,
                    }}
                  />
                </div>

                <div className="absolute inset-0 pointer-events-none z-10">
                  {starParticles.map((particle, index) => (
                    <span
                      key={`star-${index}`}
                      ref={(element) => {
                        starRefs.current[index] = element;
                      }}
                      className="absolute rounded-full"
                      style={{
                        left: particle.left,
                        top: particle.top,
                        width: particle.size,
                        height: particle.size,
                        backgroundColor: particle.color,
                        opacity: 0.2,
                      }}
                    />
                  ))}
                </div>

                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-15">
                  <svg
                    className="absolute inset-0 h-full w-full"
                    viewBox={`0 0 ${orbitSvgSize} ${orbitSvgSize}`}
                    aria-hidden="true"
                  >
                    <defs>
                      <filter id="orbitGlowBlur" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="4" result="blur" />
                        <feMerge>
                          <feMergeNode in="blur" />
                          <feMergeNode in="blur" />
                        </feMerge>
                      </filter>
                    </defs>
                    <circle
                      cx={orbitCenter}
                      cy={orbitCenter}
                      r={orbitRingRadius}
                      fill="none"
                      stroke="var(--color-accent)"
                      strokeWidth="1.5"
                      opacity="0.25"
                    />
                    <circle
                      ref={orbitGlowRef}
                      cx={orbitCenter}
                      cy={orbitCenter}
                      r={orbitRingRadius}
                      fill="none"
                      stroke="var(--color-accent)"
                      strokeWidth="1.5"
                      strokeDasharray={`${orbitGlowDashLength} ${orbitRingCircumference}`}
                      strokeLinecap="round"
                      opacity="0.75"
                      filter="url(#orbitGlowBlur)"
                    />
                  </svg>
                </div>

                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                  <div className="relative w-full max-w-95 rounded-4xl border border-border/20 bg-background/10 backdrop-blur-[45px] p-8 text-center shadow-[0_20px_80px_rgba(0,0,0,0.08)]">
                    <div className="flex flex-col items-center justify-center gap-4">
                      <div
                    className="flex h-20 w-20 items-center justify-center rounded-full bg-accent/10 text-accent"
                    style={{
                      boxShadow: "0 0 28px color-mix(in srgb, var(--color-accent) 18%, transparent)",
                    }}
                  >
                        {activeSkill?.iconUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={activeSkill.iconUrl}
                            alt={`${activeSkill.name} logo`}
                            loading="lazy"
                            className="h-10 w-10 object-contain"
                          />
                        ) : (
                          <ActiveIcon size={36} />
                        )}
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
                  className="absolute inset-0 flex items-center justify-center z-30"
                  style={{
                    transform: "translateZ(0)",
                    willChange: "transform",
                  }}
                >
                  {skills.map((skill, index) => {
                    const baseAngle = index * stepAngle;
                    const angle = baseAngle;
                    const angleRad = ((angle - 90) * Math.PI) / 180;
                    const x = orbitBaseRadius * Math.cos(angleRad);
                    const y = orbitBaseRadius * Math.sin(angleRad);
                    const isActive = index === activeIdx;
                    const isHovered = index === hoveredIdx;
                    const FallbackIcon = lucideIcons[skill.iconFallback] || Code;

                    return (
                      <button
                        key={skill.id}
                        type="button"
                        onClick={() => setActiveIdx(index)}
                        onMouseEnter={() => setHoveredIdx(index)}
                        onMouseLeave={() => setHoveredIdx(null)}
                        aria-label={`Activate ${skill.name}`}
                        className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                        style={{
                          left: `calc(50% + ${x}px)`,
                          top: `calc(50% + ${y}px)`,
                        }}
                      >
                        <div
                          ref={(element) => {
                            iconRefs.current[index] = element;
                          }}
                          className="relative h-14 w-14 rounded-full border flex items-center justify-center"
                          style={{
                            borderColor: "color-mix(in srgb, var(--color-border) 18%, transparent)",
                            backgroundColor: "var(--color-background-elevated)",
                            backgroundImage: "radial-gradient(circle at center, color-mix(in srgb, var(--color-foreground) 10%, transparent) 0%, transparent 55%)",
                            boxShadow: isActive || isHovered
                              ? "0 0 28px color-mix(in srgb, var(--color-accent) 60%, transparent)"
                              : "0 0 16px color-mix(in srgb, var(--color-accent) 35%, transparent)",
                            transform: `rotate(${-currentWheelRotation}deg)`,
                          }}
                        >
                          {skill.iconUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={skill.iconUrl}
                              alt={`${skill.name} logo`}
                              loading="lazy"
                              className="h-8 w-8 object-contain"
                            />
                          ) : (
                            <FallbackIcon size={24} />
                          )}
                        </div>
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
              const FallbackIcon = lucideIcons[skill.iconFallback] || Code;
              return (
                <div
                  key={skill.id}
                  className="mobile-skill-card bg-background-elevated/40 border border-border/40 p-5 rounded-2xl flex gap-4 items-start shadow-md"
                >
                  <div className="p-3 rounded-2xl bg-accent/10 text-accent shrink-0">
                    {skill.iconUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={skill.iconUrl}
                        alt={`${skill.name} logo`}
                        loading="lazy"
                        className="h-6 w-6 object-contain"
                      />
                    ) : (
                      <FallbackIcon size={24} />
                    )}
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
