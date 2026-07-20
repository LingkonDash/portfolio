"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { Cpu, BookOpen, Building2, ArrowRight } from "lucide-react";

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

// ─── Content ──────────────────────────────────────────────────────────────────
const PROJECTS = [
  {
    number: "01",
    title: "Recipe Hut",
    slug: "recipe-hut",
    Icon: Cpu,
    description:
      "AI-powered recipe discovery and cooking platform built as a complete Agentic AI application. Beyond standard CRUD and content browsing, it integrates two distinct agentic AI systems — a context-aware conversational assistant and a reasoning-driven pantry agent — that go beyond simple text generation to demonstrate memory, tool use, and decision-making. An intelligent cooking assistant with AI chat, recipe insights, and interactive guidance.",
  },
  {
    number: "02",
    title: "Book Hub",
    slug: "book-hub",
    Icon: BookOpen,
    description:
      "BookHub is a full-stack Online Book Delivery Management System where readers can browse a curated library, pay a delivery fee via Stripe, and have physical books delivered to their doorstep. Librarians manage their book listings and track delivery statuses. Admins oversee the entire platform — approving books, managing users, and monitoring transactions.",
  },
  {
    number: "03",
    title: "Space Sync",
    slug: "space-sync",
    Icon: Building2,
    description:
      "SpaceSync is a full-stack co-working and event space booking platform where renters discover and book desks, meeting rooms, event halls, and studios — and hosts list and manage their own spaces. Built with a strict three-role system (User, Host, Admin), server-driven filtering, and a fully typed TypeScript stack across both frontend and backend.",
  },
] as const;

// ─── Component ────────────────────────────────────────────────────────────────
export default function Projects() {
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
            gsap.to(entry, { opacity: 1, duration: 0.5, ease: "power2.out" });
          } else {
            if (textEl) {
              tweens.push(
                gsap.to(textEl, { opacity: 1, x: 0, duration: 0.75, ease: "power2.out" })
              );
            }
            if (imgEl) {
              tweens.push(
                gsap.to(imgEl, {
                  opacity: 1,
                  x: 0,
                  duration: 0.75,
                  ease: "power2.out",
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
      gsap.set(ship, { x: w * 0.5, y: 0 });

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
          scrub: 1.5,
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
            {PROJECTS.map((project, i) => {
              const { Icon } = project;
              // Even index (0, 2): description LEFT | image RIGHT
              // Odd index  (1):    image LEFT       | description RIGHT
              const isEven = i % 2 === 0;

              return (
                <div
                  key={project.slug}
                  ref={(el) => {
                    entryRefs.current[i] = el;
                  }}
                  // Mobile: single column — pad left to clear the connector line
                  // Desktop: two columns — normal gap layout
                  className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center pl-8 lg:pl-0"
                >
                  {/* ── Text column ─────────────────────────────────────── */}
                  <div
                    className={`project-text flex flex-col gap-5 ${
                      isEven ? "md:order-1" : "md:order-2"
                    }`}
                  >
                    {/* Project index label */}
                    <span className="font-mono text-[10px] tracking-[0.35em] text-muted/40 uppercase">
                      {project.number}&thinsp;/&thinsp;0{PROJECTS.length}
                    </span>

                    {/* Title — large typographic treatment */}
                    <h3 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-foreground leading-[0.95]">
                      {project.title}
                    </h3>

                    {/* Description */}
                    <p className="text-sm md:text-base text-foreground/70 leading-relaxed font-sans max-w-prose">
                      {project.description}
                    </p>

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

                  {/* ── Image placeholder column ─────────────────────────── */}
                  <div
                    className={`project-image ${
                      isEven ? "md:order-2" : "md:order-1"
                    }`}
                  >
                    <div className="relative aspect-video rounded-2xl overflow-hidden border border-border/40 bg-background-elevated/30 flex items-center justify-center shadow-2xl">
                      {/*
                        TODO: Replace this placeholder with the actual project screenshot.
                        Usage once the image file is available:

                        import Image from "next/image";
                        <Image
                          src={`/images/projects/${project.slug}.jpg`}
                          alt={`${project.title} screenshot`}
                          fill
                          className="object-cover"
                          priority={i === 0}
                        />
                      */}

                      {/* Watermark project number */}
                      <span
                        aria-hidden="true"
                        className="absolute font-black text-foreground/[0.04] select-none pointer-events-none leading-none tracking-tighter"
                        style={{ fontSize: "clamp(5rem, 18vw, 11rem)" }}
                      >
                        {project.number}
                      </span>

                      {/* Centered icon group */}
                      <div className="relative z-10 flex flex-col items-center gap-3">
                        <div className="p-4 rounded-2xl bg-accent/10 border border-accent/20 text-accent/75">
                          <Icon size={30} strokeWidth={1.5} />
                        </div>
                        <span className="text-[10px] font-mono uppercase tracking-widest text-muted/40">
                          {project.title}
                        </span>
                      </div>

                      {/* Subtle grid overlay */}
                      <div
                        aria-hidden="true"
                        className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:18px_18px] pointer-events-none"
                      />

                      {/* Bottom gradient fade */}
                      <div
                        aria-hidden="true"
                        className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-background-elevated/40 to-transparent pointer-events-none"
                      />
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
