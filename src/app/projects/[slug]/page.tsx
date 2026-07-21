import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProjectBySlug, getProjects } from "@/lib/data";
import ProjectDetailClient from "./ProjectDetailClient";

// ─── Static Params ────────────────────────────────────────────────────────────
// Pre-generate all known project slugs at build time.
export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.map((p) => ({ slug: p.slug }));
}

// ─── Per-page SEO Metadata ───────────────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    return {
      title: "Project Not Found | Lingkon Dash",
    };
  }

  return {
    title: `${project.title} | Lingkon Dash`,
    description: project.description,
    openGraph: {
      title: `${project.title} | Lingkon Dash`,
      description: project.description,
      type: "article",
    },
  };
}

// ─── Page (Server Component) ─────────────────────────────────────────────────
// This server component resolves the slug → project data, then hands off
// to the client component for GSAP animations and interactivity.
export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  return <ProjectDetailClient project={project!} />;
}

