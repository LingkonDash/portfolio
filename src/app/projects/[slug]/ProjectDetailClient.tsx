"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ArrowLeft, ExternalLink, GitBranch } from "lucide-react";
import type { Project } from "@/types/data";
import { projectIcons } from "@/lib/project-icons";

interface Props {
  project: Project;
}

export default function ProjectDetailClient({ project }: Props) {
  const Icon = projectIcons[project.iconKey];

  // ── Refs for staggered entrance ──────────────────────────────────────────
  const backRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const targets = [
      backRef.current,
      headerRef.current,
      buttonsRef.current,
      bodyRef.current,
      galleryRef.current,
    ].filter(Boolean);

    if (prefersReducedMotion) {
      gsap.set(targets, { opacity: 0 });
      gsap.to(targets, { opacity: 1, duration: 0.4, stagger: 0, ease: "power2.out" });
    } else {
      gsap.set(targets, { opacity: 0, y: 24 });
      gsap.to(targets, {
        opacity: 1,
        y: 0,
        duration: 0.65,
        stagger: 0.1,
        ease: "power3.out",
        delay: 0.05,
      });
    }
  }, []);

  return (
    <div className="min-h-screen py-28 md:py-36 font-sans">
      <div className="max-w-4xl mx-auto px-4 md:px-8 flex flex-col gap-14">

        {/* ── Back navigation ──────────────────────────────────────────────── */}
        <div ref={backRef}>
          <Link
            href="/#projects"
            data-cursor="link"
            className="inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-accent transition-colors duration-200 group"
          >
            <ArrowLeft
              size={15}
              className="transition-transform duration-200 group-hover:-translate-x-1"
            />
            Back to Projects
          </Link>
        </div>

        {/* ── Header ───────────────────────────────────────────────────────── */}
        <div ref={headerRef} className="flex flex-col gap-4">
          {/* Project number */}
          <span className="font-mono text-[10px] tracking-[0.35em] text-muted/50 uppercase">
            {project.number}&thinsp;/&thinsp;03
          </span>

          {/* Title + icon row */}
          <div className="flex items-center gap-5">
            <div className="p-3.5 rounded-2xl bg-accent/10 border border-accent/25 text-accent shrink-0">
              <Icon size={28} strokeWidth={1.5} />
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight text-foreground leading-none">
              {project.title}
            </h1>
          </div>
        </div>

        {/* ── Action buttons (placeholders until links are available) ──────── */}
        <div ref={buttonsRef} className="flex flex-wrap gap-3">
          {/* Live URL button */}
          {project.liveUrl ? (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="button"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-accent text-accent-foreground font-bold text-sm tracking-wide hover:opacity-90 transition-opacity"
            >
              <ExternalLink size={14} />
              Live Demo
            </a>
          ) : (
            /* TODO: Replace with a real <a> once the live URL is available */
            <button
              disabled
              data-cursor="button"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-foreground/8 text-foreground/35 border border-foreground/10 font-bold text-sm tracking-wide cursor-not-allowed select-none"
            >
              <ExternalLink size={14} />
              Live Demo — Coming Soon
            </button>
          )}

          {/* GitHub repo button */}
          {project.repoUrl ? (
            <a
              href={project.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="button"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-border hover:border-accent/50 bg-background-elevated/50 text-foreground hover:text-accent font-bold text-sm tracking-wide transition-all duration-200"
            >
              <GitBranch size={14} />
              View Source
            </a>
          ) : (
            /* TODO: Replace with a real <a> once the repository is made public */
            <button
              disabled
              data-cursor="button"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-foreground/10 bg-foreground/5 text-foreground/35 font-bold text-sm tracking-wide cursor-not-allowed select-none"
            >
              <GitBranch size={14} />
              Source — Coming Soon
            </button>
          )}
        </div>

        {/* ── Long description body ─────────────────────────────────────────── */}
        <div ref={bodyRef} className="flex flex-col gap-5 border-t border-border/20 pt-10">
          <h2 className="text-lg font-bold tracking-tight text-foreground">
            About this project
          </h2>
          <p className="text-base text-foreground/75 leading-[1.85] font-sans max-w-prose">
            {project.longDescription}
          </p>
        </div>

        {/* ── Image gallery ─────────────────────────────────────────────────── */}
        <div ref={galleryRef} className="flex flex-col gap-5">
          <h2 className="text-lg font-bold tracking-tight text-foreground">
            Screenshots
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {project.images.map((imgSrc, idx) => (
              <div
                key={idx}
                className={`relative rounded-2xl overflow-hidden border border-border/40 bg-background-elevated/30 flex items-center justify-center shadow-xl ${
                  idx === 0 ? "md:col-span-2 aspect-video" : "aspect-video"
                }`}
              >
                {imgSrc ? (
                  // Real image — swap the placeholder below with next/image once available
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imgSrc}
                    alt={`${project.title} screenshot ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  /*
                    TODO: Replace this placeholder with the real screenshot.
                    Usage once images are available:

                    import Image from "next/image";
                    <Image
                      src={`/images/projects/${project.slug}-${idx + 1}.jpg`}
                      alt={`${project.title} screenshot ${idx + 1}`}
                      fill
                      className="object-cover"
                      priority={idx === 0}
                    />
                  */
                  <>
                    {/* Watermark slot number */}
                    <span
                      aria-hidden="true"
                      className="absolute font-black text-foreground/[0.04] select-none pointer-events-none leading-none"
                      style={{ fontSize: "clamp(4rem, 14vw, 9rem)" }}
                    >
                      {String(idx + 1).padStart(2, "0")}
                    </span>

                    {/* Centered placeholder label */}
                    <div className="relative z-10 flex flex-col items-center gap-2">
                      <div className="p-3 rounded-xl bg-accent/10 border border-accent/20 text-accent/60">
                        <Icon size={22} strokeWidth={1.5} />
                      </div>
                      <span className="text-[10px] font-mono uppercase tracking-widest text-muted/40">
                        Screenshot {idx + 1}
                      </span>
                    </div>

                    {/* Grid texture */}
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:18px_18px] pointer-events-none"
                    />
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Footer back link ──────────────────────────────────────────────── */}
        <div className="pt-4 border-t border-border/20">
          <Link
            href="/#projects"
            data-cursor="link"
            className="inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-accent transition-colors duration-200 group"
          >
            <ArrowLeft
              size={15}
              className="transition-transform duration-200 group-hover:-translate-x-1"
            />
            Back to Projects
          </Link>
        </div>
      </div>
    </div>
  );
}
