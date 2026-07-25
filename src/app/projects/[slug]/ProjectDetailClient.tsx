"use client";

import React, { useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowLeft, ExternalLink, GitBranch, AlertTriangle, Rocket } from "lucide-react";
import type { Project } from "@/types/data";
import { projectIcons } from "@/lib/project-icons";
import { ANIM_CONFIG } from "@/lib/animation-config";

gsap.registerPlugin(ScrollTrigger);

interface Props {
  project: Project;
  nextProject: Project;
}

function chunkLongDescription(text: string) {
  const sentences = text.match(/[^.!?]+[.!?]+(?:\s|$)/g)?.map((sentence) => sentence.trim()) ?? [text];
  const chunks: string[] = [];

  for (let i = 0; i < sentences.length; i += 2) {
    chunks.push(sentences.slice(i, i + 2).join(" "));
  }

  return chunks;
}

export default function ProjectDetailClient({ project, nextProject }: Props) {
  const Icon = projectIcons[project.iconKey];
  const storyParagraphs = useMemo(() => chunkLongDescription(project.longDescription), [project.longDescription]);
  const galleryImages = project.images.slice(1);

  // Refs used for scoped GSAP animation — no global class-name driven CSS,
  // everything here is explicitly set and animated by this component only.
  const heroBackRef = useRef<HTMLDivElement>(null);
  const heroEyebrowRef = useRef<HTMLDivElement>(null);
  const heroTitleRef = useRef<HTMLHeadingElement>(null);
  const heroDescRef = useRef<HTMLParagraphElement>(null);
  const heroCtaRef = useRef<HTMLDivElement>(null);
  const heroImageRef = useRef<HTMLDivElement>(null);

  const techSectionRef = useRef<HTMLDivElement>(null);
  const storySectionRef = useRef<HTMLDivElement>(null);
  const behindTheBuildSectionRef = useRef<HTMLDivElement>(null);
  const gallerySectionRef = useRef<HTMLDivElement>(null);
  const nextSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const heroTargets = [
      heroBackRef.current,
      heroEyebrowRef.current,
      heroTitleRef.current,
      heroDescRef.current,
      heroCtaRef.current,
    ].filter(Boolean);

    const triggers: ScrollTrigger[] = [];
    const tweens: gsap.core.Tween[] = [];

    if (prefersReducedMotion) {
      // Show everything immediately — no motion.
      gsap.set(
        [
          ...heroTargets,
          heroImageRef.current,
          techSectionRef.current?.querySelectorAll("[data-reveal]"),
          storySectionRef.current?.querySelectorAll("[data-reveal]"),
          behindTheBuildSectionRef.current?.querySelectorAll("[data-reveal]"),
          gallerySectionRef.current?.querySelectorAll("[data-reveal]"),
          nextSectionRef.current,
        ].filter(Boolean) as gsap.TweenTarget[],
        { opacity: 1, y: 0, x: 0, scale: 1, clearProps: "transform" }
      );
      return;
    }

    // ── Hero: animates in on mount, not on scroll (it's above the fold) ──────
    gsap.set(heroTargets, { opacity: 0, y: 24 });
    gsap.set(heroImageRef.current, { opacity: 0, scale: 0.97 });

    const heroTl = gsap.timeline();
    heroTl
      .to(heroTargets, {
        opacity: 1,
        y: 0,
        duration: ANIM_CONFIG.duration,
        ease: ANIM_CONFIG.ease,
        stagger: ANIM_CONFIG.stagger ?? 0.1,
      })
      .to(
        heroImageRef.current,
        { opacity: 1, scale: 1, duration: ANIM_CONFIG.duration, ease: ANIM_CONFIG.ease },
        "<0.15"
      );
    tweens.push(heroTl as unknown as gsap.core.Tween);

    // ── Generic helper: fade+slide-up reveal for any section's [data-reveal] children ──
    const wireScrollReveal = (container: HTMLElement | null) => {
      if (!container) return;
      const items = container.querySelectorAll<HTMLElement>("[data-reveal]");
      if (!items.length) return;

      gsap.set(items, { opacity: 0, y: 20 });

      const st = ScrollTrigger.create({
        trigger: container,
        start: "top bottom-=100",
        once: true,
        onEnter: () => {
          tweens.push(
            gsap.to(items, {
              opacity: 1,
              y: 0,
              duration: ANIM_CONFIG.duration,
              ease: ANIM_CONFIG.ease,
              stagger: ANIM_CONFIG.stagger ?? 0.08,
            })
          );
        },
      });
      triggers.push(st);
    };

    wireScrollReveal(techSectionRef.current);
    wireScrollReveal(storySectionRef.current);
    wireScrollReveal(behindTheBuildSectionRef.current);
    wireScrollReveal(gallerySectionRef.current);

    // Next-project band: single fade+slide, no children stagger needed.
    if (nextSectionRef.current) {
      gsap.set(nextSectionRef.current, { opacity: 0, y: 20 });
      const st = ScrollTrigger.create({
        trigger: nextSectionRef.current,
        start: "top bottom-=80",
        once: true,
        onEnter: () => {
          tweens.push(
            gsap.to(nextSectionRef.current, {
              opacity: 1,
              y: 0,
              duration: ANIM_CONFIG.duration,
              ease: ANIM_CONFIG.ease,
            })
          );
        },
      });
      triggers.push(st);
    }

    return () => {
      triggers.forEach((t) => t.kill());
      tweens.forEach((t) => t.kill());
    };
  }, []);

  return (
    // No background classes here — this must stay transparent so the
    // global fixed star field (mounted in the root layout, behind all
    // page content) remains visible through this route too.
    <main className="min-h-screen py-24 md:py-32 font-sans">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-20 px-4 md:px-8">
        <section
          ref={heroImageRef}
          className="relative overflow-hidden rounded-[2.5rem] border border-border/20 bg-background-elevated/60 backdrop-blur-xl p-6 shadow-[0_30px_90px_rgba(0,0,0,0.35)] md:p-10"
        >
          <div
            ref={heroBackRef}
            className="pointer-events-none absolute left-6 top-6 hidden text-[7rem] font-black uppercase tracking-[0.3em] text-foreground/5 md:block"
          >
            {project.number}
          </div>

          <div className="relative z-10 flex flex-col gap-8">
            <div className="max-w-max">
              <Link
                href="/#projects"
                data-cursor="link"
                className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.28em] text-muted transition-colors duration-200 hover:text-accent"
              >
                <ArrowLeft size={16} />
                Back to Projects
              </Link>
            </div>

            <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(420px,0.9fr)] lg:items-end">
              <div className="flex flex-col gap-6 text-left">
                <div ref={heroEyebrowRef} className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full border border-accent/20 bg-accent/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.32em] text-accent">
                    Project {project.number}
                  </span>
                  <div className="flex h-11 w-11 items-center justify-center rounded-3xl bg-accent/10 text-accent shadow-sm shadow-accent/5">
                    <Icon size={20} strokeWidth={1.5} />
                  </div>
                </div>

                <h1
                  ref={heroTitleRef}
                  className="max-w-3xl text-5xl font-black tracking-tight text-foreground md:text-6xl lg:text-7xl"
                >
                  {project.title}
                </h1>

                <p
                  ref={heroDescRef}
                  className="max-w-2xl text-lg leading-9 text-foreground/75 md:text-xl"
                >
                  {project.description}
                </p>

                <div ref={heroCtaRef} className="flex flex-wrap gap-3">
                  <a
                    href={project.liveUrl ?? undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-cursor="button"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-bold uppercase tracking-[0.18em] text-accent-foreground transition duration-200 hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <ExternalLink size={16} />
                    Live Demo
                  </a>

                  <a
                    href={project.repoUrl ?? undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-cursor="button"
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-accent bg-background/90 px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-foreground transition duration-200 hover:bg-accent/10"
                  >
                    <GitBranch size={16} />
                    View Code
                  </a>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-[2rem] border border-border/20 bg-background/40 aspect-[4/3] min-h-[340px] shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
                <Image
                  src={project.images[0]}
                  alt={`${project.title} preview`}
                  fill
                  sizes="(min-width: 1024px) 35vw, (min-width: 768px) 60vw, 90vw"
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        </section>

        <section ref={techSectionRef} className="flex flex-col gap-6">
          <div className="flex flex-wrap gap-3">
            {project.techStack.map((tech) => (
              <div
                key={tech}
                data-reveal
                data-cursor="card"
                className="inline-flex items-center rounded-full border border-accent/20 bg-accent/10 backdrop-blur-md px-4 py-2 text-sm font-semibold text-foreground transition duration-200 hover:border-accent/40 hover:bg-accent/15"
              >
                {tech}
              </div>
            ))}
          </div>
        </section>

        <section ref={storySectionRef} className="grid gap-10">
          <div data-reveal className="max-w-2xl">
            <span className="text-xs font-mono uppercase tracking-[0.32em] text-accent">Overview</span>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-foreground md:text-4xl">The project story</h2>
          </div>

          <div className="grid gap-8">
            {storyParagraphs.map((paragraph, index) => (
              <p
                key={index}
                data-reveal
                className="max-w-3xl text-base leading-8 text-foreground/75"
              >
                {paragraph}
              </p>
            ))}
          </div>
        </section>

        {(project.challenges || project.futureImprovements) ? (
          <section ref={behindTheBuildSectionRef} className="grid gap-10">
            <div data-reveal className="max-w-2xl">
              <span className="text-xs font-mono uppercase tracking-[0.32em] text-accent">Behind the build</span>
              <h2 className="mt-4 text-3xl font-black tracking-tight text-foreground md:text-4xl">
                Challenges &amp; what&rsquo;s next
              </h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {project.challenges ? (
                <div
                  data-reveal
                  data-cursor="card"
                  className="flex flex-col gap-4 rounded-[2rem] border border-border/20 bg-background-elevated/60 backdrop-blur-xl p-8 shadow-[0_20px_60px_rgba(0,0,0,0.3)]"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                    <AlertTriangle size={20} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-xl font-black tracking-tight text-foreground">Challenges faced</h3>
                  <p className="text-base leading-8 text-foreground/75">{project.challenges}</p>
                </div>
              ) : null}

              {project.futureImprovements ? (
                <div
                  data-reveal
                  data-cursor="card"
                  className="flex flex-col gap-4 rounded-[2rem] border border-border/20 bg-background-elevated/60 backdrop-blur-xl p-8 shadow-[0_20px_60px_rgba(0,0,0,0.3)]"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                    <Rocket size={20} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-xl font-black tracking-tight text-foreground">What&rsquo;s next</h3>
                  <p className="text-base leading-8 text-foreground/75">{project.futureImprovements}</p>
                </div>
              ) : null}
            </div>
          </section>
        ) : null}

        {galleryImages.length > 0 ? (
          <section ref={gallerySectionRef} className="grid gap-8">
            <div data-reveal className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <span className="text-xs font-mono uppercase tracking-[0.32em] text-accent">Visual tour</span>
                <h2 className="mt-4 text-3xl font-black tracking-tight text-foreground md:text-4xl">Visual showcase</h2>
              </div>
              <p className="max-w-xl text-sm text-foreground/60">
                A clean gallery of the project&rsquo;s remaining screens.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {galleryImages.map((image, index) => (
                <div
                  key={image}
                  data-reveal
                  data-cursor="card"
                  className="group relative overflow-hidden rounded-[2rem] border border-border/10 bg-background-elevated/40 backdrop-blur-md shadow-[0_20px_40px_rgba(0,0,0,0.3)] transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_30px_70px_rgba(0,0,0,0.4)]"
                >
                  <div className="aspect-[4/3] w-full overflow-hidden rounded-[2rem]">
                    <Image
                      src={image}
                      alt={`${project.title} gallery ${index + 2}`}
                      fill
                      sizes="(min-width: 1024px) 30vw, (min-width: 768px) 45vw, 90vw"
                      className="object-cover transition duration-500 group-hover:scale-105"
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <section ref={nextSectionRef} className="pb-10">
          <Link
            href={`/projects/${nextProject.slug}`}
            data-cursor="button"
            className="group block overflow-hidden rounded-[2.5rem] border border-border/20 bg-background-elevated/60 backdrop-blur-xl p-6 transition duration-300 hover:-translate-y-1 hover:border-accent/40 md:p-8"
          >
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-[1fr_auto] lg:items-center">
              <div className="space-y-4">
                <span className="text-xs font-mono uppercase tracking-[0.32em] text-accent">Next Project</span>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
                  <span className="text-4xl font-black tracking-tight text-foreground">{nextProject.number}</span>
                  <div>
                    <p className="text-sm uppercase tracking-[0.22em] text-muted">Continue the story</p>
                    <h3 className="mt-2 text-2xl font-black tracking-tight text-foreground md:text-3xl">{nextProject.title}</h3>
                  </div>
                </div>
              </div>

              <div className="relative mx-auto w-full max-w-[280px] overflow-hidden rounded-[2rem] border border-border/20 bg-background/40 aspect-[4/3] min-h-[220px] shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
                <Image
                  src={nextProject.images[0]}
                  alt={`Preview of ${nextProject.title}`}
                  fill
                  sizes="(min-width: 1024px) 280px, 45vw"
                  className="object-cover"
                />
              </div>
            </div>
          </Link>
        </section>
      </div>
    </main>
  );
}