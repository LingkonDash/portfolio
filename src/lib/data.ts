import fs from "fs/promises";
import path from "path";
import { Project, Skill, Education } from "@/types/data";

// Keeping this file to server-side usage by convention/comment.
// This module uses Node.js fs APIs and must not be imported in client components.

export async function getProjects(): Promise<Project[]> {
  const filePath = path.join(process.cwd(), "public", "data", "projects.json");
  const fileContent = await fs.readFile(filePath, "utf-8");
  const projects: Project[] = JSON.parse(fileContent);
  return projects.sort((a, b) => a.order - b.order);
}

export async function getProjectBySlug(slug: string): Promise<Project | undefined> {
  const projects = await getProjects();
  return projects.find((p) => p.slug === slug);
}

export async function getSkills(): Promise<Skill[]> {
  const filePath = path.join(process.cwd(), "public", "data", "skills.json");
  const fileContent = await fs.readFile(filePath, "utf-8");
  const skills: Skill[] = JSON.parse(fileContent);
  return skills.sort((a, b) => a.order - b.order);
}

export async function getEducation(): Promise<Education[]> {
  const filePath = path.join(process.cwd(), "public", "data", "education.json");
  const fileContent = await fs.readFile(filePath, "utf-8");
  const education: Education[] = JSON.parse(fileContent);
  return education;
}
