import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProjectBySlug, getProjects } from "@/lib/data";
import ProjectDetailClient from "./ProjectDetailClient";

export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    return {
      title: "Project Not Found | Lingkon Dash",
      description: "The requested project could not be found.",
    };
  }

  return {
    title: `${project.title} | Lingkon Dash`,
    description: project.description,
    openGraph: {
      title: `${project.title} | Lingkon Dash`,
      description: project.description,
      type: "article",
      images: project.images.length
        ? [
            {
              url: project.images[0],
              alt: project.title,
            },
          ]
        : undefined,
    },
  };
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const projects = await getProjects();
  const project = projects.find((item) => item.slug === slug);

  if (!project) {
    notFound();
  }

  const currentIndex = projects.findIndex((item) => item.slug === slug);
  const nextProject = projects[(currentIndex + 1) % projects.length];

  return <ProjectDetailClient project={project} nextProject={nextProject} />;
}

