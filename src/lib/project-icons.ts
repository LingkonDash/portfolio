/**
 * Client-side icon map for projects.
 *
 * This file is intentionally separate from lib/projects.ts because Lucide icon
 * components are functions and cannot be included in serializable data passed
 * across the Next.js server → client boundary.
 *
 * Usage:
 *   import { projectIcons } from "@/lib/project-icons";
 *   const Icon = projectIcons[project.iconKey];
 */

import { Cpu, BookOpen, Building2, type LucideIcon } from "lucide-react";
import type { Project } from "@/types/data";

export const projectIcons: Record<Project["iconKey"], LucideIcon> = {
  "recipe-hut": Cpu,
  "book-hub": BookOpen,
  "space-sync": Building2,
};
