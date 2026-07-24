"use client";

import React, { useMemo, useState } from "react";
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
import { Skill } from "@/types/data";
import { VscVscode } from "react-icons/vsc";

/**
 * NOTE: this assumes `Skill` (in @/types/data) has an optional `category`
 * field, e.g. category?: "frontend" | "backend" | "tools".
 * Add it to your type + JSON data so filtering works. Skills without a
 * category still show up under "All".
 */
type SkillCategory = "frontend" | "backend" | "tools";
type CategorizedSkill = Skill & { category?: SkillCategory; order?: number };

// Maps a skill's name (or its existing iconFallback field) to a react-icon.
// Add new entries here as you add skills — key is lowercase, no punctuation.
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

// Lowercases and strips punctuation so ids like "vs-code" / names like
// "Express.js" line up with iconMap keys regardless of spacing/dashes/dots.
const normalize = (value: string) =>
  value.trim().toLowerCase().replace(/[.]/g, "").replace(/[-_]/g, " ").trim();

const resolveIcon = (skill: CategorizedSkill): IconType => {
  return (
    iconMap[normalize(skill.id ?? "")] ??
    iconMap[normalize(skill.name)] ??
    iconMap[normalize(skill.iconFallback ?? "")] ??
    FaCode
  );
};

const filters: { key: "all" | SkillCategory; label: string }[] = [
  { key: "all", label: "All" },
  { key: "frontend", label: "Frontend" },
  { key: "backend", label: "Backend" },
  { key: "tools", label: "Tools" },
];

export default function Skills({ skills }: { skills: CategorizedSkill[] }) {
  const [activeFilter, setActiveFilter] = useState<"all" | SkillCategory>("all");

  const filteredSkills = useMemo(() => {
    const list =
      activeFilter === "all"
        ? skills
        : skills.filter((skill) => skill.category === activeFilter);
    return [...list].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [skills, activeFilter]);

  return (
    <section id="skills" className="py-16 px-6 md:py-24 border-t border-border/10">
      <div className="max-w-5xl mx-auto w-full">
        <h2 className="text-2xl md:text-3xl font-black tracking-tight text-foreground mb-6 text-left">
          Skills & Technologies
        </h2>

        {/* Category filters */}
        <div className="flex flex-wrap gap-3 mb-10">
          {filters.map((filter) => {
            const isActive = activeFilter === filter.key;
            return (
              <button
                key={filter.key}
                type="button"
                onClick={() => setActiveFilter(filter.key)}
                className={`px-4 py-2 rounded-full text-sm md:text-sm font-semibold tracking-wide transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 ${
                  isActive
                    ? "border border-accent bg-accent/15 text-accent shadow-[0_0_0_1px_rgba(56,189,248,0.35)]"
                    : "border border-border/30 bg-background-elevated/30 text-foreground hover:border-accent/40 hover:bg-accent/10"
                }`}
              >
                {filter.label}
              </button>
            );
          })}
        </div>

        {/* Skill grid — translucent glass cards so the starfield behind shows through */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredSkills.map((skill) => {
            const Icon = resolveIcon(skill);
            return (
              <div
                key={skill.id}
                className="group relative flex flex-col items-center justify-center gap-4 overflow-hidden rounded-[2rem] border border-border/20 bg-background-elevated/15 p-5 text-center backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-accent/30 hover:bg-background-elevated/40 hover:shadow-[0_0_40px_rgba(56,189,248,0.14)]"
              >
                <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-accent/10 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none" />
                <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full bg-accent/10 text-accent shadow-[0_0_24px_rgba(56,189,248,0.16)] border border-accent/20">
                  <Icon size={24} />
                </div>
                <span className="relative z-10 text-base font-semibold tracking-tight text-foreground">
                  {skill.name}
                </span>
              </div>
            );
          })}
        </div>

        {filteredSkills.length === 0 && (
          <p className="text-sm text-foreground/60 mt-8 text-center">
            No skills in this category yet.
          </p>
        )}
      </div>
    </section>
  );
}