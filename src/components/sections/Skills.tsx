"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import type { IconType } from "react-icons";
import { IoLogoCss3 } from "react-icons/io";
import {
  SiHtml5,
  SiSass,
  SiJavascript,
  SiTypescript,
  SiReact,
  SiNextdotjs,
  SiTailwindcss,
  SiRedux,
  SiVuedotjs,
  SiAngular,
  SiGithub,
  SiGit,
  SiNodedotjs,
  SiExpress,
  SiFirebase,
  SiMongodb,
  SiPostgresql,
  SiMysql,
  SiGraphql,
  SiRedis,
  SiDocker,
  SiFigma,
  SiPostman,
  SiVercel,
  SiVite,
  SiPython,
  SiPhp,
} from "react-icons/si";
import { FaJava, FaAws, FaCode, FaShieldAlt } from "react-icons/fa";
import { FiServer, FiTool } from "react-icons/fi";
import { VscVscode } from "react-icons/vsc";

/**
 * Skill shape as it now arrives from the backend, e.g.
 * {
 *   id: "html",
 *   name: "HTML",
 *   iconUrl: "https://cdn.simpleicons.org/html5/E34F26",
 *   icon: "FileCode",
 *   category: "frontend",
 * }
 *
 * Update your `Skill` type in @/types/data to match this shape
 * (id, name, iconUrl?, icon?, category?) — this file defines a local
 * `WheelSkill` type so it works as a drop-in even before you do.
 */
import { Skill, SkillCategory } from "@/types/data";

export type { SkillCategory };
export type WheelSkill = Skill;

// ---------------------------------------------------------------------------
// Icon fallback map (used when a skill has no iconUrl, or the image 404s)
// ---------------------------------------------------------------------------

const iconMap: Record<string, IconType> = {
  html: SiHtml5,
  html5: SiHtml5,
  css: IoLogoCss3,
  css3: IoLogoCss3,
  sass: SiSass,
  scss: SiSass,
  javascript: SiJavascript,
  js: SiJavascript,
  typescript: SiTypescript,
  ts: SiTypescript,
  react: SiReact,
  reactjs: SiReact,
  "react js": SiReact,
  next: SiNextdotjs,
  nextjs: SiNextdotjs,
  "next.js": SiNextdotjs,
  tailwind: SiTailwindcss,
  tailwindcss: SiTailwindcss,
  redux: SiRedux,
  vue: SiVuedotjs,
  vuejs: SiVuedotjs,
  angular: SiAngular,
  github: SiGithub,
  git: SiGit,
  node: SiNodedotjs,
  nodejs: SiNodedotjs,
  "node js": SiNodedotjs,
  express: SiExpress,
  expressjs: SiExpress,
  firebase: SiFirebase,
  mongodb: SiMongodb,
  mongo: SiMongodb,
  postgresql: SiPostgresql,
  postgres: SiPostgresql,
  mysql: SiMysql,
  graphql: SiGraphql,
  redis: SiRedis,
  docker: SiDocker,
  dockers: SiDocker,
  figma: SiFigma,
  postman: SiPostman,
  vercel: SiVercel,
  vite: SiVite,
  vscode: VscVscode,
  "vs code": VscVscode,
  "visual studio code": VscVscode,
  python: SiPython,
  php: SiPhp,
  java: FaJava,
  aws: FaAws,
  betterauth: FaShieldAlt,
  "better-auth": FaShieldAlt,
  "better auth": FaShieldAlt,
};

const normalize = (value: string) =>
  value.trim().toLowerCase().replace(/[.]/g, "").replace(/[-_]/g, " ").trim();

const resolveIcon = (skill: WheelSkill): IconType => {
  return (
    iconMap[normalize(skill.id ?? "")] ??
    iconMap[normalize(skill.name)] ??
    iconMap[normalize(skill.icon ?? "")] ??
    FaCode
  );
};

// simpleicons.org URLs end in /<slug>/<HEXCOLOR> — pull that out so each
// skill can glow in its own brand color without needing a separate field.
const HEX_RE = /^[0-9a-fA-F]{6}$/;
const FALLBACK_GLOW = "#38bdf8"; // matches this project's --accent (sky-400)

const getSkillColor = (skill: WheelSkill): string => {
  if (skill.iconUrl) {
    const last = skill.iconUrl.split("/").pop() ?? "";
    const hex = last.split(/[?#]/)[0];
    if (HEX_RE.test(hex)) return `#${hex}`;
  }
  return FALLBACK_GLOW;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

/** Splits skills into rings of at most `maxPerRing`, spreading any
 * remainder onto the outer rings first (bigger circumference, more room). */
function distributeIntoRings(
  skills: WheelSkill[],
  maxPerRing = 7
): WheelSkill[][] {
  const total = skills.length;
  if (total === 0) return [];
  const ringCount = Math.max(1, Math.ceil(total / maxPerRing));
  const base = Math.floor(total / ringCount);
  const remainder = total - base * ringCount;

  const sizes = new Array(ringCount).fill(base);
  for (let i = 0; i < remainder; i++) sizes[ringCount - 1 - i] += 1;

  const rings: WheelSkill[][] = [];
  let cursor = 0;
  for (const size of sizes) {
    rings.push(skills.slice(cursor, cursor + size));
    cursor += size;
  }
  return rings;
}

function ringRadius(index: number, ringCount: number, half: number) {
  const minFrac = 0.34;
  const maxFrac = 0.94;
  if (ringCount <= 1) return half * 0.62;
  const frac = minFrac + (index / (ringCount - 1)) * (maxFrac - minFrac);
  return half * frac;
}

/** Tracks an element's rendered width, Recharts-ResponsiveContainer style. */
function useContainerWidth<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setWidth(el.offsetWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return [ref, width] as const;
}

// ---------------------------------------------------------------------------
// Single orbiting skill node
// ---------------------------------------------------------------------------

function SkillNode({
  skill,
  size,
  hovered,
  onEnter,
  onLeave,
}: {
  skill: WheelSkill;
  size: number;
  hovered: boolean;
  onEnter: () => void;
  onLeave: () => void;
}) {
  const color = getSkillColor(skill);
  const Icon = resolveIcon(skill);
  const [imgFailed, setImgFailed] = useState(false);
  const showImg = Boolean(skill.iconUrl) && !imgFailed;

  return (
    <div
      className="relative flex items-center justify-center outline-none pointer-events-auto"
      style={{ width: size, height: size }}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onFocus={onEnter}
      onBlur={onLeave}
      tabIndex={0}
      role="img"
      aria-label={skill.name}
    >
      {/* chat-bubble tooltip */}
      <div
        className={`pointer-events-none absolute left-1/2 bottom-full mb-3 -translate-x-1/2 whitespace-nowrap rounded-lg border border-border/20 bg-background-elevated/95 px-2.5 py-1 text-xs font-semibold text-foreground shadow-lg backdrop-blur-sm transition-all duration-200 z-30 ${
          hovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"
        }`}
      >
        {skill.name}
        <span className="absolute left-1/2 top-full -mt-[5px] h-2 w-2 -translate-x-1/2 rotate-45 border-b border-r border-border/20 bg-background-elevated/95" />
      </div>

      <div
        className="flex items-center justify-center rounded-full border bg-background-elevated/30 backdrop-blur-md transition-all duration-300 focus-visible:ring-2 focus-visible:ring-accent/50"
        style={{
          width: size,
          height: size,
          borderColor: hovered ? color : "rgba(255,255,255,0.12)",
          boxShadow: hovered
            ? `0 0 ${size * 0.7}px ${color}55, 0 0 ${size * 0.2}px ${color}aa`
            : "none",
          transform: hovered ? "scale(1.18)" : "scale(1)",
        }}
      >
        {showImg && skill.iconUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={skill.iconUrl}
            alt={skill.name}
            width={size * 0.5}
            height={size * 0.5}
            style={{ width: size * 0.5, height: size * 0.5, objectFit: "contain" }}
            loading="lazy"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <Icon size={size * 0.48} style={{ color: hovered ? color : undefined }} />
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// The wheel
// ---------------------------------------------------------------------------

function SkillWheel({ skills }: { skills: WheelSkill[] }) {
  const [containerRef, width] = useContainerWidth<HTMLDivElement>();
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const rings = useMemo(() => distributeIntoRings(skills), [skills]);
  const half = width / 2;
  const iconSize = clamp(width * 0.086, 26, 52);
  const centerSize = clamp(width * 0.15, 44, 84);
  const paused = hoveredId !== null;

  return (
    <div className="flex flex-col items-center">
      <div
        ref={containerRef}
        className="relative aspect-square w-full max-w-[550px] mx-auto"
      >
        {width > 0 && (
          <>
            {/* orbit paths — the visible track each ring's skills travel along */}
            {rings.map((_, i) => {
              const radius = ringRadius(i, rings.length, half);
              return (
                <div
                  key={`guide-${i}`}
                  className="absolute top-1/2 left-1/2 pointer-events-none rounded-full border border-accent/50"
                  style={{
                    width: radius * 2,
                    height: radius * 2,
                    transform: "translate(-50%, -50%)",
                    boxShadow:
                      "0 0 16px rgba(56,189,248,0.08), inset 0 0 16px rgba(56,189,248,0.06)",
                  }}
                />
              );
            })}

            {/* center */}
            <div
              className="absolute top-1/2 left-1/2 z-20 flex items-center justify-center rounded-full border border-accent/30 bg-accent/10 text-accent shadow-[0_0_40px_rgba(56,189,248,0.25)]"
              style={{
                width: centerSize,
                height: centerSize,
                transform: "translate(-50%, -50%)",
              }}
            >
              <FaCode size={centerSize * 0.42} />
            </div>

            {rings.map((ringSkills, ringIndex) => {
              const radius = ringRadius(ringIndex, rings.length, half);
              const duration = 26 + ringIndex * 16;
              const clockwise = ringIndex % 2 === 0;
              const spinName = clockwise
                ? "skillwheel-spin-cw"
                : "skillwheel-spin-ccw";
              const counterName = clockwise
                ? "skillwheel-spin-ccw"
                : "skillwheel-spin-cw";

              return (
                <div
                  key={ringIndex}
                  data-orbit
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    animation: `${spinName} ${duration}s linear infinite`,
                    animationPlayState: paused ? "paused" : "running",
                  }}
                >
                  {ringSkills.map((skill, i) => {
                    const angle =
                      (360 / ringSkills.length) * i + ringIndex * 18;
                    return (
                      <div
                        key={skill.id}
                        className="absolute top-1/2 left-1/2 z-10 pointer-events-none"
                        style={{
                          width: iconSize,
                          height: iconSize,
                          transform: `rotate(${angle}deg) translate(${radius}px) rotate(${-angle}deg) translate(-50%, -50%)`,
                        }}
                      >
                        <div
                          data-orbit
                          className="pointer-events-none"
                          style={{
                            width: "100%",
                            height: "100%",
                            animation: `${counterName} ${duration}s linear infinite`,
                            animationPlayState: paused ? "paused" : "running",
                          }}
                        >
                          <SkillNode
                            skill={skill}
                            size={iconSize}
                            hovered={hoveredId === skill.id}
                            onEnter={() => setHoveredId(skill.id)}
                            onLeave={() =>
                              setHoveredId((current) =>
                                current === skill.id ? null : current
                              )
                            }
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </>
        )}
      </div>

      <style>{`
        @keyframes skillwheel-spin-cw {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes skillwheel-spin-ccw {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          [data-orbit] { animation: none !important; }
        }
      `}</style>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Category summary cards
// ---------------------------------------------------------------------------

const CATEGORY_META: Record<
  SkillCategory,
  { label: string; eyebrow: string; icon: IconType }
> = {
  frontend: {
    label: "Frontend Development",
    eyebrow: "UI & Interaction",
    icon: FaCode,
  },
  backend: {
    label: "Backend Architecture",
    eyebrow: "Server & Database",
    icon: FiServer,
  },
  tools: {
    label: "Tools & Integrations",
    eyebrow: "Services & DevOps",
    icon: FiTool,
  },
};

function SkillCategoryCard({
  category,
  skills,
}: {
  category: SkillCategory;
  skills: WheelSkill[];
}) {
  const meta = CATEGORY_META[category];
  const Icon = meta.icon;

  return (
    <div className="flex h-full flex-col rounded-3xl border border-border/15 bg-background-elevated/20 p-6 backdrop-blur-xl transition-colors duration-300 hover:border-accent/25">
      <div className="flex items-center justify-between mb-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/20 text-accent">
          <Icon size={16} />
        </div>
        <span className="rounded-full border border-border/20 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-foreground/50">
          {meta.eyebrow}
        </span>
      </div>

      <h3 className="text-lg font-bold text-foreground mb-4">{meta.label}</h3>

      <div className="flex flex-wrap gap-2 mb-6 min-h-[2rem]">
        {skills.length === 0 && (
          <span className="text-xs text-foreground/40">
            No skills tagged yet.
          </span>
        )}
        {skills.map((skill) => {
          const SkillIcon = resolveIcon(skill);
          return (
            <span
              key={skill.id}
              className="inline-flex items-center gap-1.5 rounded-full border border-border/20 bg-background/40 px-3 py-1.5 text-xs font-medium text-foreground/90"
            >
              {skill.iconUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={skill.iconUrl} alt="" className="h-3.5 w-3.5" />
              ) : (
                <SkillIcon size={14} className="text-accent" />
              )}
              {skill.name}
            </span>
          );
        })}
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-border/10 pt-4">
        <span className="text-xs text-foreground/50">
          {skills.length} core {skills.length === 1 ? "technology" : "technologies"}
        </span>
        <span className="h-2 w-2 rounded-full bg-accent shadow-[0_0_8px_rgba(56,189,248,0.6)] animate-pulse" />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Section
// ---------------------------------------------------------------------------

export default function Skills({ skills }: { skills: WheelSkill[] }) {
  const grouped = useMemo(() => {
    const map: Record<SkillCategory, WheelSkill[]> = {
      frontend: [],
      backend: [],
      tools: [],
    };
    for (const skill of skills) {
      if (skill.category && map[skill.category]) {
        map[skill.category].push(skill);
      }
    }
    return map;
  }, [skills]);

  return (
    <section id="skills" className="py-16 px-6 md:py-24 border-t border-border/10">
      <div className="max-w-5xl mx-auto w-full">
        <h2 className="text-2xl md:text-3xl lg:text-5xl font-black tracking-tight text-foreground mb-3 text-left border-l-4 border-l-accent pl-4">
          Skills & <span className="text-accent">Technologies</span>
        </h2>
        <p className="text-sm md:text-base text-foreground/60 mb-12 max-w-2xl pl-4">
          React, Next.js and Node.js sit at the core of how I build — REST APIs and MongoDB on the backend, Tailwind CSS, HeroUI and Framer Motion for interfaces that feel considered, not default.
        </p>

        <SkillWheel skills={skills} />

        <div className="text-center max-w-xl mx-auto mt-20 mb-10">
          <h3 className="text-xl md:text-3xl font-bold text-accent mt-2">
            How I put the pieces together
          </h3>
          <p className="text-sm text-foreground/60 mt-2">
            Everything orbiting above, grouped by what it actually does — the
            interface, the server, and the workflow holding it together.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {(Object.keys(CATEGORY_META) as SkillCategory[]).map((cat) => (
            <SkillCategoryCard key={cat} category={cat} skills={grouped[cat]} />
          ))}
        </div>
      </div>
    </section>
  );
}