"use client";

import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  CalendarDays,
  GraduationCap,
  Rocket,
  Compass,
  Target,
  Satellite,
} from "lucide-react";
import type { Education as EducationType } from "@/types/data";
import { ANIM_CONFIG } from "@/lib/animation-config";

gsap.registerPlugin(ScrollTrigger);

/**
 * The backend only sends the academic records. `background` and `gpa`
 * are optional so this still works if either field is ever missing.
 */
type EducationItem = EducationType & {
  background?: string;
  gpa?: number;
};

interface JourneyProps {
  education: EducationItem[];
}

/* ---------- static "journey" content (not backend driven) ---------- */

const CORE_TECH = [
  "HTML5 & CSS3",
  "JavaScript (ES6+)",
  "React.js",
  "Tailwind CSS",
  "Node.js & Express.js",
  "MongoDB",
  "REST APIs",
  "Git & GitHub",
];

const CURRENTLY_LEARNING: { label: string; note: string }[] = [
  { label: "TypeScript", note: "Deep Diving" },
  { label: "Next.js", note: "Deeply Exploring & building projects" },
  { label: "PostgreSQL", note: "Learning" },
  { label: "Prisma ORM", note: "Learning" },
  { label: "Node.js & Express.js", note: "Improving backend dev" },
  { label: "MongoDB", note: "Strengthening database skills" },
  { label: "Docker", note: "Exploring containerization" },
  { label: "Git & GitHub", note: "Practicing daily" },
  { label: "CI/CD", note: "Exploring deployment" },
];

const FOCUS_STACK = [
  "JavaScript",
  "TypeScript",
  "React",
  "Next.js",
  "Node.js",
  "Express.js",
  "PostgreSQL",
  "Prisma",
  "Docker",
  "CI/CD",
];

/* ---------- helpers ---------- */

function getShortTag(certificate: string) {
  const match = certificate.match(/\b([A-Z]{2,4})\b/);
  if (match?.[1]) return match[1];

  const words = certificate.split(/\s+/).filter(Boolean);
  if (!words.length) return "Edu";

  const firstWord = words[0].replace(/[^A-Za-z]/g, "");
  return firstWord.slice(0, 4).toUpperCase();
}

function getEducationSummary(item: EducationItem) {
  const background = item.background
    ? ` with a background in ${item.background}`
    : "";
  const gpa = item.gpa ? `, finishing with a GPA of ${item.gpa}` : "";
  return `Completed ${item.certificate}${background}${gpa}, laying the groundwork for everything built since.`;
}

/* ---------- component ---------- */

export default function Journey({ education }: JourneyProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const chapterRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (!sectionRef.current) return;

    const heading = headingRef.current;
    const chapters = chapterRefs.current.filter(Boolean) as HTMLDivElement[];

    if (!heading || !chapters.length) return;

    if (prefersReducedMotion) {
      gsap.set([heading, ...chapters], { opacity: 1, y: 0, x: 0 });
      return;
    }

    const triggers: ScrollTrigger[] = [];

    triggers.push(
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top bottom-=80",
        once: true,
        onEnter: () => {
          gsap.fromTo(
            heading,
            { opacity: 0, y: 20 },
            {
              opacity: 1,
              y: 0,
              duration: ANIM_CONFIG.duration,
              ease: ANIM_CONFIG.ease,
            }
          );
        },
      })
    );

    chapters.forEach((chapter, index) => {
      triggers.push(
        ScrollTrigger.create({
          trigger: chapter,
          start: "top bottom-=90",
          once: true,
          onEnter: () => {
            gsap.fromTo(
              chapter,
              { opacity: 0, x: -16 },
              {
                opacity: 1,
                x: 0,
                duration: ANIM_CONFIG.duration,
                ease: ANIM_CONFIG.ease,
                delay: index * 0.1,
              }
            );
          },
        })
      );
    });

    return () => {
      triggers.forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <section
      id="education"
      ref={sectionRef}
      className="py-16 px-4 md:py-24 border-t border-border/10"
    >
      <div className="max-w-5xl mx-auto w-full">
        {/* Header */}
        <div ref={headingRef} className="mb-14 opacity-0">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.3em] text-accent/70 mb-3">
            <Satellite size={14} />
            <span>My Journey</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-foreground border-l-4 border-l-accent pl-4">
            Education <span className="text-accent">&amp; Learning</span>
          </h2>
        </div>

        {/* Flight path */}
        <div className="relative">
          <div
            aria-hidden
            className="absolute top-6 bottom-6 w-px"
            style={{
              left: "21px",
              backgroundImage:
                "repeating-linear-gradient(to bottom, var(--color-accent) 0, var(--color-accent) 5px, transparent 5px, transparent 11px)",
              opacity: 0.45,
            }}
          />

          <div className="space-y-12">
            {/* 01 — Academic Background */}
            <div
              ref={(node) => {
                chapterRefs.current[0] = node;
              }}
              className="relative flex gap-4 opacity-0"
            >
              <ChapterNode icon={GraduationCap} number="01" />
              <div className="flex-1 min-w-0 pt-1.5">
                <ChapterTitle
                  eyebrow="Chapter 01"
                  title="Academic Background"
                />
                <div className="mt-4 space-y-4">
                  {education.map((item, index) => (
                    <div
                      key={`${item.certificate}-${index}`}
                      className="rounded-lg border-l-4 border-l-accent border border-border/20 bg-accent/5 p-4 backdrop-blur-sm"
                    >
                      <span className="inline-flex items-center rounded-full border border-accent/30 bg-accent/15 px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-accent">
                        {getShortTag(item.certificate)}
                      </span>
                      <p className="mt-3 text-base md:text-lg font-semibold text-foreground">
                        {item.institution}
                      </p>
                      <div className="mt-2 flex items-center gap-2 text-sm text-foreground/70">
                        <CalendarDays size={14} className="text-accent/70" />
                        <span>{item.passing_year}</span>
                      </div>
                      <p className="mt-3 text-sm leading-relaxed text-foreground/60">
                        {getEducationSummary(item)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 02 — Web Development Journey */}
            <div
              ref={(node) => {
                chapterRefs.current[1] = node;
              }}
              className="relative flex gap-4 opacity-0"
            >
              <ChapterNode icon={Rocket} number="02" />
              <div className="flex-1 min-w-0 pt-1.5">
                <ChapterTitle
                  eyebrow="Chapter 02"
                  title="Web Development Journey"
                />
                <div className="mt-4 rounded-lg border-l-4 border-l-accent border border-border/20 bg-accent/5 p-4 backdrop-blur-sm">
                  <span className="inline-flex items-center rounded-full border border-accent/30 bg-accent/15 px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-accent">
                    Program
                  </span>
                  <p className="mt-3 text-base md:text-lg font-semibold text-foreground">
                    Complete Web Development Program
                  </p>
                  <p className="text-sm text-foreground/70">Programming Hero</p>
                  <div className="mt-2 flex items-center gap-2 text-sm text-foreground/70">
                    <CalendarDays size={14} className="text-accent/70" />
                    <span>2026</span>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-foreground/60">
                    Completed an intensive web development program focused on
                    building practical, full-stack web applications.
                  </p>

                  <p className="mt-4 mb-2 text-[0.65rem] font-mono uppercase tracking-[0.2em] text-muted">
                    Core Technologies
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {CORE_TECH.map((tech) => (
                      <span
                        key={tech}
                        className="rounded-full border border-accent/30 bg-accent/10 px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider text-accent"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 03 — Currently Learning */}
            <div
              ref={(node) => {
                chapterRefs.current[2] = node;
              }}
              className="relative flex gap-4 opacity-0"
            >
              <ChapterNode icon={Compass} number="03" />
              <div className="flex-1 min-w-0 pt-1.5">
                <ChapterTitle eyebrow="Chapter 03" title="Currently Learning" />
                <p className="mt-3 text-sm leading-relaxed text-foreground/60">
                  Continuously expanding full-stack skills with the
                  technologies used to build scalable, production-ready
                  applications.
                </p>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {CURRENTLY_LEARNING.map((skill) => (
                    <div
                      key={skill.label}
                      className="flex items-start gap-2 rounded-lg border border-accent/50 bg-accent/5 p-4 backdrop-blur-sm"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent animate-pulse" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {skill.label}
                        </p>
                        <p className="text-[11px] font-mono text-muted">
                          {skill.note}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 04 — Current Focus */}
            <div
              ref={(node) => {
                chapterRefs.current[3] = node;
              }}
              className="relative flex gap-4 opacity-0"
            >
              <ChapterNode icon={Target} number="04" />
              <div className="flex-1 min-w-0 pt-1.5">
                <ChapterTitle
                  eyebrow="Chapter 04"
                  title="What I'm Doing Currently"
                />
                <div
                  className="mt-4 rounded-lg border p-4 backdrop-blur-sm"
                  style={{
                    borderColor:
                      "color-mix(in srgb, var(--color-accent) 30%, var(--color-border) 70%)",
                    background:
                      "linear-gradient(135deg, color-mix(in srgb, var(--color-accent) 8%, transparent), transparent 60%)",
                  }}
                >
                  <p className="text-sm leading-relaxed text-foreground/75">
                    Currently focused on becoming a strong full-stack web
                    developer by moving beyond tutorials and building
                    real-world applications. Actively building personal
                    projects to sharpen problem-solving, backend
                    architecture, API design, database modelling,
                    authentication, and deployment &mdash; taking ideas from
                    concept to complete, production-ready applications.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {FOCUS_STACK.map((tech) => (
                      <span
                        key={tech}
                        className="rounded-full border border-accent/30 bg-accent/10 px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider text-accent"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- small presentational pieces ---------- */

function ChapterNode({
  icon: Icon,
  number,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  number: string;
}) {
  return (
    <div className="relative z-10 shrink-0">
      <div className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-accent bg-background-elevated shadow-[0_0_0_4px_rgba(56,189,248,0.12)]">
        <Icon size={18} className="text-accent" />
      </div>
      <span className="absolute -top-1.5 -right-1.5 rounded-full bg-accent px-1.5 py-[1px] text-[9px] font-mono font-bold text-accent-foreground">
        {number}
      </span>
    </div>
  );
}

function ChapterTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div>
      <p className="text-[0.65rem] font-mono uppercase tracking-[0.25em] text-muted">
        {eyebrow}
      </p>
      <h3 className="mt-1 text-xl md:text-2xl font-bold text-foreground">
        {title}
      </h3>
    </div>
  );
}