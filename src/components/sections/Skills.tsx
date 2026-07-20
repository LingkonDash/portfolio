"use client";

import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
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

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

const skillsData = [
  {
    name: "HTML",
    icon: FileCode,
    description:
      "I use HTML5 as the structural backbone of every project, focusing on semantic elements for accessibility, SEO, and maintainability. I ensure proper document hierarchy, optimized media handling, and clean, readable markup that integrates seamlessly with modern frameworks.",
  },
  {
    name: "CSS",
    icon: Layout,
    description:
      "I design responsive and scalable interfaces using modern CSS techniques like Flexbox, Grid, and custom properties. I focus on performance, reusability, and consistency, often combining CSS with utility-first approaches for rapid UI development.",
  },
  {
    name: "React",
    icon: Code,
    description:
      "I build dynamic, component-driven interfaces with React, focusing on reusable logic through hooks and clean state management. I emphasize predictable data flow and performance-conscious rendering to keep applications fast as they scale.",
  },
  {
    name: "Next.js",
    icon: Globe,
    description:
      "I use Next.js to build production-ready full-stack applications, leveraging server-side rendering, routing, and API routes to deliver fast, SEO-friendly experiences. I focus on structuring apps for scalability and maintainability from the start.",
  },
  {
    name: "Node.js",
    icon: Server,
    description:
      "I use Node.js to build efficient, event-driven backend systems, handling asynchronous operations and server logic with a focus on performance and reliability under real-world load.",
  },
  {
    name: "Express.js",
    icon: Terminal,
    description:
      "I structure RESTful APIs and backend architecture with Express.js, emphasizing clean routing, middleware design, and secure, maintainable server logic.",
  },
  {
    name: "MongoDB",
    icon: Database,
    description:
      "I design flexible, scalable data models with MongoDB, focusing on efficient schema design and query performance to support real-world application needs.",
  },
  {
    name: "better-auth",
    icon: ShieldCheck,
    description:
      "I implement secure, modern authentication flows using better-auth, focusing on reliable session handling and a smooth, frictionless login experience for users.",
  },
  {
    name: "Vercel",
    icon: TrendingUp,
    description:
      "I deploy and manage full-stack applications on Vercel, taking advantage of its seamless CI/CD pipeline and edge infrastructure to ship fast, reliable production builds.",
  },
  {
    name: "Vite",
    icon: Zap,
    description:
      "I use Vite for rapid local development, relying on its fast HMR and optimized build process to keep the development feedback loop tight.",
  },
  {
    name: "VS Code",
    icon: Settings,
    description:
      "I rely on VS Code as my primary development environment, customizing it with extensions and workflows that keep my coding process efficient and organized.",
  },
];

export default function Skills() {
  const containerRef = useRef<HTMLDivElement>(null);
  const wheelRef = useRef<HTMLDivElement>(null);
  const mobileRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const [isFinePointer, setIsFinePointer] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    setIsFinePointer(window.matchMedia("(pointer: fine)").matches);
    setPrefersReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  // Desktop Circle Carousel logic
  useEffect(() => {
    if (!isFinePointer || prefersReducedMotion || !containerRef.current || !wheelRef.current) return;

    const container = containerRef.current;
    const wheel = wheelRef.current;
    const items = wheel.querySelectorAll(".skill-node");

    const totalItems = skillsData.length;
    const arcDegrees = 180; // half circle
    const stepAngle = arcDegrees / (totalItems - 1);

    // Initial positioning along the upper half-arc (offset by -90 to face upward)
    items.forEach((item, index) => {
      const angle = index * stepAngle - 90;
      const angleRad = (angle * Math.PI) / 180;
      const radius = 320; // Radius in pixels

      const x = radius * Math.cos(angleRad);
      const y = radius * Math.sin(angleRad);

      gsap.set(item, {
        x: x,
        y: y,
        // Compensate rotation so text stays upright
        rotate: -angle - 90,
      });
    });

    // Pinned ScrollTrigger rotation
    const rotationTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: container,
        start: "top top",
        end: "+=1200",
        pin: true,
        scrub: 0.5,
        onUpdate: (self) => {
          const progress = self.progress;
          // Calculate overall rotation angle (rotates by -180 degrees total)
          const targetRotation = -progress * arcDegrees;
          gsap.set(wheel, { rotate: targetRotation });

          // Correct node items so they stay upright
          items.forEach((item, index) => {
            const initialAngle = index * stepAngle - 90;
            gsap.set(item, {
              rotate: -initialAngle - 90 - targetRotation,
            });
          });

          // Determine current active node (focal position is top center)
          const rawIndex = progress * (totalItems - 1);
          const currentActive = Math.min(Math.max(Math.round(rawIndex), 0), totalItems - 1);
          setActiveIdx(currentActive);
        },
      },
    });

    return () => {
      rotationTimeline.scrollTrigger?.kill();
      rotationTimeline.kill();
    };
  }, [isFinePointer, prefersReducedMotion]);

  // Mobile list entry animations
  useEffect(() => {
    if (isFinePointer && !prefersReducedMotion) return;
    if (!mobileRef.current) return;

    const cards = mobileRef.current.querySelectorAll(".mobile-skill-card");
    const triggers: ScrollTrigger[] = [];

    cards.forEach((card) => {
      const trigger = ScrollTrigger.create({
        trigger: card,
        start: "top bottom-=60",
        onEnter: () => {
          gsap.fromTo(
            card,
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
          );
        },
      });
      triggers.push(trigger);
    });

    return () => {
      triggers.forEach((t) => t.kill());
    };
  }, [isFinePointer, prefersReducedMotion]);

  const activeSkill = skillsData[activeIdx];

  return (
    <section
      id="skills"
      ref={containerRef}
      className="py-16 md:py-24 border-t border-border/10 flex flex-col justify-center min-h-screen select-none overflow-hidden"
    >
      <div className="max-w-5xl mx-auto w-full px-4">
        <h2 className="text-2xl md:text-3xl font-black tracking-tight text-foreground mb-12 text-left">
          Skills & Technologies
        </h2>

        {/* 1. DESKTOP CAROUSEL: (pointer: fine) & (!prefersReducedMotion) */}
        {isFinePointer && !prefersReducedMotion ? (
          <div className="relative w-full h-[600px] hidden lg:flex flex-col justify-end items-center">
            {/* Focal Central Content (Description Display) */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 max-w-lg text-center flex flex-col items-center gap-4 z-10 p-6 bg-background/40 backdrop-blur-md border border-border/30 rounded-2xl shadow-xl">
              {activeSkill && (
                <>
                  <div className="p-3 rounded-full bg-accent/10 text-accent animate-pulse">
                    <activeSkill.icon size={36} />
                  </div>
                  <h3 className="text-2xl font-bold tracking-tight text-foreground">
                    {activeSkill.name}
                  </h3>
                  <p className="text-sm md:text-base text-foreground/80 leading-relaxed font-sans">
                    {activeSkill.description}
                  </p>
                </>
              )}
            </div>

            {/* Rotating Half-Circle Track */}
            <div className="relative w-[640px] h-[640px] border border-border/20 rounded-full translate-y-[320px] flex items-center justify-center">
              <div ref={wheelRef} className="relative w-full h-full">
                {skillsData.map((skill, index) => {
                  const Icon = skill.icon;
                  const isActive = index === activeIdx;

                  return (
                    <div
                      key={skill.name}
                      data-cursor="card"
                      className="skill-node absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center cursor-none transition-all duration-300"
                    >
                      <div
                        className={`p-4 rounded-full border shadow-lg transition-all duration-300 ${
                          isActive
                            ? "bg-accent text-accent-foreground border-accent scale-125 z-20"
                            : "bg-background-elevated/80 text-muted border-border hover:border-accent/40 hover:text-foreground scale-100"
                        }`}
                      >
                        <Icon size={24} />
                      </div>
                      <span
                        className={`text-xs font-mono font-bold mt-2 uppercase tracking-wider transition-colors duration-300 ${
                          isActive ? "text-accent" : "text-muted"
                        }`}
                      >
                        {skill.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* 2. MOBILE & REDUCED MOTION: Stepper list fallback */
          <div ref={mobileRef} className="flex flex-col gap-6 w-full max-w-xl mx-auto">
            {skillsData.map((skill) => {
              const Icon = skill.icon;
              return (
                <div
                  key={skill.name}
                  className="mobile-skill-card bg-background-elevated/40 border border-border/40 p-5 rounded-2xl flex gap-4 items-start shadow-md hover:border-accent/30 transition-colors duration-300"
                >
                  <div className="p-3 rounded-xl bg-accent/10 text-accent shrink-0">
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
