"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { ArrowRight, ExternalLink, GitBranch } from "lucide-react";
import { Project } from "@/types/data";
import { projectIcons } from "@/lib/project-icons";
import { ANIM_CONFIG } from "@/lib/animation-config";

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

// ─── Content is now imported from @/lib/projects ─────────────────────────────

// ─── Component ────────────────────────────────────────────────────────────────
export default function Projects({ projects }: { projects: Project[] }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const shipRef = useRef<SVGGElement>(null);
  const entryRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const isFinePointer = window.matchMedia("(pointer: fine)").matches;

    const section = sectionRef.current;
    const content = contentRef.current;
    if (!section || !content) return;

    const stTriggers: ScrollTrigger[] = [];
    const tweens: gsap.core.Tween[] = [];

    // ── 1. Per-entry entrance animations ──────────────────────────────────────
    entryRefs.current.forEach((entry, i) => {
      if (!entry) return;
      const isEven = i % 2 === 0;
      const textEl = entry.querySelector<HTMLElement>(".project-text");
      const imgEl = entry.querySelector<HTMLElement>(".project-image");

      if (prefersReducedMotion) {
        gsap.set(entry, { opacity: 0 });
      } else {
        if (textEl) gsap.set(textEl, { opacity: 0, x: isEven ? -35 : 35 });
        if (imgEl) gsap.set(imgEl, { opacity: 0, x: isEven ? 35 : -35 });
      }

      const st = ScrollTrigger.create({
        trigger: entry,
        start: "top bottom-=100",
        once: true,
        onEnter: () => {
          if (prefersReducedMotion) {
            gsap.to(entry, { opacity: 1, duration: ANIM_CONFIG.duration, ease: ANIM_CONFIG.ease });
          } else {
            if (textEl) {
              tweens.push(
                gsap.to(textEl, { opacity: 1, x: 0, duration: ANIM_CONFIG.duration, ease: ANIM_CONFIG.ease })
              );
            }
            if (imgEl) {
              tweens.push(
                gsap.to(imgEl, {
                  opacity: 1,
                  x: 0,
                  duration: ANIM_CONFIG.duration,
                  ease: ANIM_CONFIG.ease,
                  delay: 0.12,
                })
              );
            }
          }
        },
      });
      stTriggers.push(st);
    });

    // ── 2. Spaceship MotionPath (desktop fine-pointer, no reduced motion) ──────
    const svg = svgRef.current;
    const pathEl = pathRef.current;
    const ship = shipRef.current;

    if (isFinePointer && !prefersReducedMotion && svg && pathEl && ship) {
      // Measure content area (section might be taller than viewport)
      const w = content.offsetWidth;
      const h = content.scrollHeight;

      // Size the SVG to cover the entire content area
      svg.style.width = `${w}px`;
      svg.style.height = `${h}px`;

      // S-curve cubic bezier: start center-top → bulge right at 33% →
      //                        bulge left at 67% → end center-bottom
      const d =
        `M ${w * 0.5} 0 ` +
        `C ${w * 0.82} ${h * 0.33}, ${w * 0.18} ${h * 0.66}, ${w * 0.5} ${h}`;
      pathEl.setAttribute("d", d);

      // Kick the ship to path origin before animation starts
      gsap.set(ship, { x: w * 0.5, y: 0, rotation: 0, transformOrigin: "50% 50%" });

      const shipTween = gsap.to(ship, {
        motionPath: {
          path: pathEl,
          align: pathEl,
          alignOrigin: [0.5, 0.5],
          autoRotate: true,
        },
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top center",
          end: "bottom center",
          scrub: 0.7,
          invalidateOnRefresh: true,
        },
      });
      tweens.push(shipTween);
      if (shipTween.scrollTrigger) stTriggers.push(shipTween.scrollTrigger);
    }

    return () => {
      stTriggers.forEach((t) => t.kill());
      tweens.forEach((t) => t.kill());
    };
  }, []);

  const sortedProjects = [...projects].sort((a, b) => a.order - b.order);

  return (
    <section
      id="projects"
      ref={sectionRef}
      className="py-16 md:py-24 border-t border-border/10 select-none"
    >
      <div className="max-w-5xl mx-auto px-4">
        {/* Section header */}
        <h2 className="text-2xl md:text-3xl font-black tracking-tight text-foreground mb-16 md:mb-20">
          Selected Projects
        </h2>

        {/* Content wrapper — relative so the SVG overlay can be positioned inside */}
        <div ref={contentRef} className="relative">
          {/* ── Desktop SVG path + spaceship ──────────────────────────────── */}
          <svg
            ref={svgRef}
            className="absolute left-0 top-0 pointer-events-none hidden lg:block"
            style={{ zIndex: 0 }}
            overflow="visible"
            aria-hidden="true"
          >
            <defs>
              <filter id="ship-glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="2.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Dashed curved trail */}
            <path
              ref={pathRef}
              stroke="var(--color-accent)"
              strokeOpacity="0.13"
              strokeWidth="1.5"
              fill="none"
              strokeDasharray="7 5"
            />

            {/* Spaceship: a small arrowhead polygon, accent colored */}
            <g ref={shipRef} filter="url(#ship-glow)">
              {/* Main body – tip points upward (negative Y in SVG) */}
              <polygon
                points="0,-9 5.5,8 0,4 -5.5,8"
                fill="var(--color-accent)"
                fillOpacity="0.9"
              />
              {/* Engine exhaust glow dot */}
              <ellipse cx="0" cy="11" rx="3" ry="2" fill="var(--color-accent)" fillOpacity="0.35" />
            </g>
          </svg>

          {/* ── Mobile vertical connector line (single column) ──────────── */}
          <div
            aria-hidden="true"
            className="lg:hidden absolute left-3 top-2 bottom-2 w-px bg-gradient-to-b from-accent/30 via-accent/10 to-transparent pointer-events-none"
          />

          {/* ── Project entries ──────────────────────────────────────────── */}
          <div className="relative z-10 flex flex-col gap-20 md:gap-28">
            {sortedProjects.map((project, i) => {
              const Icon = projectIcons[project.iconKey];
              // Even index (0, 2): description LEFT | image RIGHT
              // Odd index  (1):    image LEFT       | description RIGHT
              const isEven = i % 2 === 0;

              return (
                <div
                  key={project.slug}
                  ref={(el) => {
                    entryRefs.current[i] = el;
                  }}
                  // Mobile: single column — image first, then text.
                  // Desktop: two columns — alternate layout.
                  className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center pl-8 lg:pl-0"
                >
                  {/* ── Image column on mobile first, desktop order alternates. */}
                  <div
                    className={`project-image group ${
                      isEven ? "md:order-2" : "md:order-1"
                    }`}
                  >
                    <div className="relative aspect-video rounded-2xl overflow-hidden border border-border/40 bg-background-elevated/30 shadow-2xl">
                      <Image
                        src={project.images[0]}
                        alt={`${project.title} preview`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 50vw"
                        priority={i === 0}
                      />

                      <div className="absolute inset-0 bg-slate-950/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                      <div className="absolute inset-0 flex items-end justify-center p-5 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                        <div className="w-full rounded-3xl border border-white/10 bg-background-elevated/80 backdrop-blur-xl px-4 py-4 shadow-2xl shadow-black/20">
                          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                            {project.liveUrl && (
                              <a
                                href={project.liveUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-accent/20 hover:border-accent/60"
                              >
                                <ExternalLink size={16} />
                                Live demo
                              </a>
                            )}
                            {project.repoUrl && (
                              <a
                                href={project.repoUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-border/40 bg-background/90 px-4 py-2 text-sm font-semibold text-foreground transition hover:border-accent/50 hover:bg-accent/10"
                              >
                                <GitBranch size={16} />
                                GitHub
                              </a>
                            )}
                          </div>
                        </div>
                      </div>

                      <div
                        aria-hidden="true"
                        className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-background-elevated/40 to-transparent pointer-events-none"
                      />
                    </div>
                  </div>

                  {/* ── Text column ─────────────────────────────────────── */}
                  <div
                    className={`project-text flex flex-col gap-5 ${
                      isEven ? "md:order-1" : "md:order-2"
                    }`}
                  >
                    {/* Project index label */}
                    <span className="font-mono text-[10px] tracking-[0.35em] text-muted/40 uppercase">
                      {project.number}&thinsp;/&thinsp;0{projects.length}
                    </span>

                    {/* Title — large typographic treatment */}
                    <h3 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-foreground leading-[0.95]">
                      {project.title}
                    </h3>

                    {/* Description */}
                    <p className="text-sm md:text-base text-foreground/70 leading-relaxed font-sans max-w-prose">
                      {project.description}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {project.techStack.map((tech) => (
                        <span
                          key={tech}
                          className="inline-flex items-center rounded-full border border-accent/25 bg-accent/15 px-3 py-1 text-[11px] font-semibold text-accent"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>

                    {/* CTA — routes to detail page (Phase 12). 404 until then by design. */}
                    <div>
                      <Link
                        href={`/projects/${project.slug}`}
                        data-cursor="button"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-accent/35 bg-accent/8 hover:bg-accent/18 hover:border-accent/65 text-accent text-sm font-bold tracking-wide transition-all duration-300 group"
                      >
                        View Details
                        <ArrowRight
                          size={14}
                          className="transition-transform duration-200 group-hover:translate-x-1"
                        />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
