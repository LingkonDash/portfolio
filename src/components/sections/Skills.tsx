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
        <div className="flex flex-wrap gap-2 mb-10">
          {filters.map((filter) => {
            const isActive = activeFilter === filter.key;
            return (
              <button
                key={filter.key}
                type="button"
                onClick={() => setActiveFilter(filter.key)}
                className="px-4 py-2 rounded-full text-sm font-semibold transition-colors border"
                style={{
                  borderColor: isActive
                    ? "var(--color-accent)"
                    : "color-mix(in srgb, var(--color-border) 30%, transparent)",
                  backgroundColor: isActive
                    ? "color-mix(in srgb, var(--color-accent) 15%, transparent)"
                    : "color-mix(in srgb, var(--color-background-elevated) 25%, transparent)",
                  color: isActive ? "var(--color-accent)" : "var(--color-foreground)",
                }}
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
                className="group flex flex-col items-center justify-center gap-3 rounded-2xl border p-5 text-center backdrop-blur-md transition-transform duration-300 hover:-translate-y-1"
                style={{
                  borderColor: "color-mix(in srgb, var(--color-border) 18%, transparent)",
                  backgroundColor: "color-mix(in srgb, var(--color-background-elevated) 10%, transparent)",
                }}
              >
                <Icon
                  size={34}
                  style={{ color: "var(--color-accent)" }}
                  className="transition-transform duration-300 group-hover:scale-110"
                />
                <span className="text-sm font-semibold tracking-tight text-foreground">
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