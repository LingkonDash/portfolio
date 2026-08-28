// About.tsx
"use client";

import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FileText, MapPin, X, Mail, Download, ExternalLink, GraduationCap, Code2, ShieldCheck } from "lucide-react";
import { ANIM_CONFIG } from "@/lib/animation-config";
import { GiThunderBlade } from "react-icons/gi";
import { LiaLinkedin } from "react-icons/lia";

gsap.registerPlugin(ScrollTrigger);

/** Four cyan HUD corner brackets framing the avatar card */
function HUDCornerBrackets() {
  return (
    <>
      <span className="pointer-events-none absolute left-3 top-3 h-3.5 w-3.5 border-l-2 border-t-2 border-accent/80 z-20" />
      <span className="pointer-events-none absolute right-3 top-3 h-3.5 w-3.5 border-r-2 border-t-2 border-accent/80 z-20" />
      <span className="pointer-events-none absolute bottom-3 left-3 h-3.5 w-3.5 border-b-2 border-l-2 border-accent/80 z-20" />
      <span className="pointer-events-none absolute bottom-3 right-3 h-3.5 w-3.5 border-b-2 border-r-2 border-accent/80 z-20" />
    </>
  );
}

export default function About() {
  const containerRef = useRef<HTMLDivElement>(null);
  const photoCardRef = useRef<HTMLDivElement>(null);
  const scanlineRef = useRef<HTMLDivElement>(null);
  const glassCardRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);

  // HeroCard-style Top-to-Bottom Scanline Animation (Slower scan rate: 4.5s duration)
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    let scanTween: gsap.core.Tween;

    if (scanlineRef.current) {
      scanTween = gsap.fromTo(
        scanlineRef.current,
        { yPercent: -120, opacity: 0 },
        {
          yPercent: 700,
          opacity: 1,
          duration: 3.5,
          repeat: -1,
          repeatDelay: 1,
          ease: "power1.inOut",
        }
      );
    }

    return () => {
      if (scanTween) scanTween.kill();
    };
  }, []);

  // ScrollReveal Animations
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const triggers: ScrollTrigger[] = [];

    if (prefersReducedMotion) {
      gsap.set([photoCardRef.current, glassCardRef.current], { opacity: 1 });
    } else {
      if (photoCardRef.current) {
        const photoTrigger = ScrollTrigger.create({
          trigger: photoCardRef.current,
          start: "top bottom-=80",
          onEnter: () => {
            gsap.fromTo(
              photoCardRef.current,
              { opacity: 0, y: 25 },
              { opacity: 1, y: 0, duration: ANIM_CONFIG.duration, ease: ANIM_CONFIG.ease }
            );
          },
        });
        triggers.push(photoTrigger);
      }

      if (glassCardRef.current) {
        const glassTrigger = ScrollTrigger.create({
          trigger: glassCardRef.current,
          start: "top bottom-=80",
          onEnter: () => {
            gsap.fromTo(
              glassCardRef.current,
              { opacity: 0, y: 25 },
              { opacity: 1, y: 0, duration: ANIM_CONFIG.duration, delay: 0.15, ease: ANIM_CONFIG.ease }
            );
          },
        });
        triggers.push(glassTrigger);
      }

      if (statsRef.current) {
        const stats = statsRef.current.querySelectorAll(".stat-item");
        const statsTrigger = ScrollTrigger.create({
          trigger: statsRef.current,
          start: "top bottom-=50",
          onEnter: () => {
            gsap.fromTo(
              stats,
              { opacity: 0, y: 15 },
              { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: "power2.out" }
            );
          },
        });
        triggers.push(statsTrigger);
      }
    }

    return () => {
      triggers.forEach((t) => t.kill());
    };
  }, []);

  // Prevent background body scroll when modal is active
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isModalOpen]);

  return (
    <section
      id="about"
      ref={containerRef}
      className="py-16 px-4 md:px-8 max-w-6xl mx-auto w-full flex flex-col justify-center select-none relative"
    >
      {/* Section Header */}
      <div className="mb-10 flex flex-col gap-1.5">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-foreground border-l-4 border-l-accent pl-4">
          About <span className="text-accent">Me</span>
        </h2>
        <p className="text-sm md:text-base text-foreground/70 max-w-2xl font-sans mt-1">
          Frontend-focused Full Stack developer building responsive, accessible, and high-performance web applications with modern web technologies.
        </p>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch w-full">
        {/* LEFT COLUMN: Futuristic HUD Scanning Photo Section */}
        <div className="lg:col-span-4 flex flex-col justify-between gap-4">
          <div
            ref={photoCardRef}
            className="group relative w-full h-[420px] rounded-2xl border border-border/30 bg-accent/[0.03] backdrop-blur-sm p-4 overflow-hidden flex flex-col justify-between shadow-xl transition-all duration-300 hover:border-accent/40"
          >
            <HUDCornerBrackets />

            {/* Status Badge: Top Left */}
            <div className="z-10 flex items-center gap-2 self-start rounded-md border border-border/40 bg-background/60 backdrop-blur-md px-2.5 py-1 text-[11px] font-mono text-foreground/90 shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>build: passing</span>
            </div>

            {/* Photo Container */}
            <div className="absolute inset-0 z-0 overflow-hidden rounded-2xl">
              <Image
                src="/images/avatar2.jpg"
                alt="Lingkon Dash"
                fill
                sizes="(max-width: 1024px) 100vw, 380px"
                className="object-cover object-center pointer-events-none"
              />
              {/* Subtle dark vignette overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-background/30" />
            </div>

            {/* HeroCard-Style Scanner Sweep Beam */}
            <div
              ref={scanlineRef}
              className="pointer-events-none absolute left-0 right-0 top-0 z-10 h-14 bg-gradient-to-b from-transparent via-accent/35 to-transparent mix-blend-screen shadow-[0_0_15px_var(--accent)]"
            >
              <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-accent shadow-[0_0_10px_var(--accent),0_0_4px_#fff]" />
            </div>

            {/* Identity Info: Bottom Left */}
            <div className="z-10 flex flex-col gap-1.5 mt-auto">
              <div className="inline-flex items-center gap-1.5 self-start rounded-full border border-emerald-500/30 bg-emerald-500/10 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-wider text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                Available for hire
              </div>

              <div>
                <h3 className="text-2xl font-bold text-foreground tracking-tight">Lingkon Dash</h3>
                <div className="flex items-center gap-1.5 text-xs text-foreground/70 font-mono mt-0.5">
                  <MapPin size={13} className="text-accent" />
                  <span>Sreemangal, Sylhet · Remote-ready</span>
                </div>
              </div>
            </div>
          </div>

          {/* Language Proficiency Chips */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="rounded-full border border-border/30 bg-accent/[0.03] backdrop-blur-sm px-3 py-1 text-xs font-mono text-foreground/90 flex items-center gap-1.5">
              <span>🇧🇩 Bangla</span>
              <span className="text-foreground/50 text-[10px]">(Native)</span>
            </div>
            <div className="rounded-full border border-border/30 bg-accent/[0.03] backdrop-blur-sm px-3 py-1 text-xs font-mono text-foreground/90 flex items-center gap-1.5">
              <span>🇬🇧 English</span>
              <span className="text-foreground/50 text-[10px]">(Intermediate)</span>
            </div>
            <div className="rounded-full border border-border/30 bg-accent/[0.03] backdrop-blur-sm px-3 py-1 text-xs font-mono text-foreground/90 flex items-center gap-1.5">
              <span>🇮🇳 Hindi</span>
              <span className="text-foreground/50 text-[10px]">(Basic)</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Clean Transparent Dark Details Card */}
        <div
          ref={glassCardRef}
          className="lg:col-span-8 rounded-2xl border border-border/30 bg-accent/[0.03] backdrop-blur-[2px] p-6 md:p-8 flex flex-col justify-between gap-8 shadow-xl relative overflow-hidden"
        >
          {/* Top Row: Heading & Full Profile Trigger */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-2xl md:text-3xl font-black text-foreground tracking-tight">
              Building the <br />
              <span className="text-accent">Modern Web Stack</span>
            </h3>

            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-accent/90 hover:bg-accent px-4 py-2 text-xs font-mono uppercase font-bold text-accent-foreground tracking-wider transition-all duration-200 self-start sm:self-auto shadow-sm active:scale-95 cursor-pointer"
            >
              <FileText size={14} />
              <span>Load Full Profile</span>
              <span className="text-xs">›</span>
            </button>
          </div>

          {/* Core Descriptive Text */}
          <div className="flex flex-col gap-4 text-sm md:text-base text-foreground/80 leading-relaxed font-sans">
            <p>
              I&apos;m a <strong className="text-foreground font-semibold">Full Stack Web Developer (MERN)</strong> specializing in building scalable web applications through a structured, step-by-step development process. My focus is on writing clean, maintainable code and building interfaces that deliver real value.
            </p>
            <p>
              With hands-on experience across <span className="text-accent font-mono font-medium">Next.js</span>, <span className="text-accent font-mono font-medium">Node.js</span>, and <span className="text-accent font-mono font-medium">MongoDB</span> ecosystems, I build complete end-to-end systems: role-based authentication, REST APIs, payment integrations, and AI-assisted agents.
            </p>
          </div>

          <div className="h-px w-full bg-border/20" />

          {/* Bottom Metrics Grid */}
          <div ref={statsRef} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="stat-item flex flex-col gap-1">
              <span className="text-2xl md:text-3xl font-black text-foreground font-mono">10+</span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-foreground/50">
                Projects Built
              </span>
            </div>

            <div className="stat-item flex flex-col gap-1">
              <span className="text-2xl md:text-3xl font-black text-foreground font-mono">MERN</span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-foreground/50">
                Core Tech Stack
              </span>
            </div>

            {/* HSC graduation year */}
            <div className="stat-item flex flex-col gap-1">
              <span className="text-2xl md:text-3xl font-black text-foreground font-mono">2023</span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-foreground/50">
                HSC Graduated
              </span>
            </div>

            <div className="stat-item flex flex-col gap-1">
              <span className="text-2xl md:text-3xl font-black text-foreground font-mono">100%</span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-foreground/50">
                Clean Code
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* POPUP MODAL: Theme-Consistent Futuristic HUD Dark Glass Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-5000 flex items-center justify-center p-4 md:p-6 bg-background/30 backdrop-blur-[2px] animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl max-h-[90vh] rounded-2xl border border-accent/40 bg-background/95 backdrop-blur-md shadow-[0_0_50px_rgba(56,189,248,0.15)] overflow-hidden flex flex-col text-foreground">
            <HUDCornerBrackets />

            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border/30 bg-accent/[0.03] backdrop-blur-sm z-10">
              <span className="font-mono text-xs text-accent tracking-wider font-semibold">
                &gt;_ whoami --full-profile
              </span>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full text-foreground/60 hover:text-accent hover:bg-accent/10 transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 md:p-8 overflow-y-auto font-sans flex flex-col gap-8 text-sm md:text-base text-foreground/80 z-10">
              {/* Header Info */}
              <div className="flex flex-col gap-2 py-1">
                <h2 className="text-2xl md:text-3xl font-black text-foreground tracking-tight">
                  Lingkon Dash
                </h2>
                <p className="text-accent font-mono text-sm font-semibold">
                  Full Stack Web Developer (MERN)
                </p>
                <p className="text-xs text-foreground/60 font-mono">
                  Sreemangal, Sylhet, Bangladesh · lingkondashdev@gmail.com · +8801776572194
                </p>
                <p className="text-sm text-foreground/80 leading-relaxed mt-2">
                  Full Stack Developer (MERN) specializing in building scalable web applications through a structured, step-by-step development process, with strong problem-solving abilities and a goal of creating efficient, modern digital products.
                </p>
              </div>

              {/* Education & Training Section */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-accent font-bold">
                  <GraduationCap size={16} />
                  <span>Education &amp; Training</span>
                </div>
                <div className="flex flex-col gap-3">
                  <div className="rounded-lg border border-accent/50 bg-accent/5 p-4 backdrop-blur-sm">
                    <h4 className="text-sm font-bold text-foreground">Programming Hero — Web Development</h4>
                    <p className="text-xs text-foreground/60 font-mono mt-1">Batch 13 · In Progress</p>
                  </div>
                  <div className="rounded-lg border border-accent/50 bg-accent/5 p-4 backdrop-blur-sm">
                    <h4 className="text-sm font-bold text-foreground">Higher Secondary Certificate (HSC)</h4>
                    <p className="text-xs text-foreground/60 font-mono mt-1">Vunobir Dhasarat High School and College · 2023</p>
                  </div>
                </div>
              </div>

              {/* Technical Skills Section */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-accent font-bold">
                  <Code2 size={16} />
                  <span>Technical Skills</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                  <div className="p-3 rounded-lg border border-accent/50 bg-accent/5 backdrop-blur-sm">
                    <strong className="text-accent font-bold">Languages:</strong> JavaScript, TypeScript (Learning)
                  </div>
                  <div className="p-3 rounded-lg border border-accent/50 bg-accent/5 backdrop-blur-sm">
                    <strong className="text-accent font-bold">Frontend:</strong> React.js, Next.js, Tailwind CSS, HeroUI, DaisyUI
                  </div>
                  <div className="p-3 rounded-lg border border-accent/50 bg-accent/5 backdrop-blur-sm">
                    <strong className="text-accent font-bold">Backend &amp; DB:</strong> Node.js, Express.js, MongoDB
                  </div>
                  <div className="p-3 rounded-lg border border-accent/50 bg-accent/5 backdrop-blur-sm">
                    <strong className="text-accent font-bold">Auth &amp; Tools:</strong> BetterAuth, JWT, Git, GitHub, Vercel, Netlify
                  </div>
                </div>
              </div>

              {/* Featured Projects Section */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-accent font-bold">
                  <ShieldCheck size={16} />
                  <span>Featured Projects</span>
                </div>

                <div className="flex flex-col gap-4">
                  {/* Project 1 */}
                  <div className="p-4 rounded-xl border border-accent/50 bg-accent/5 backdrop-blur-sm flex flex-col gap-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h4 className="font-bold text-foreground text-base">BookHub — Online Book Delivery Platform</h4>
                      <div className="flex items-center gap-2 text-xs font-mono text-accent">
                        <a href="https://bookhub-ph.web.app/" target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-1">Live <ExternalLink size={11} /></a>
                      </div>
                    </div>
                    <ul className="list-disc list-inside text-xs text-foreground/80 space-y-1">
                      <li>Role-based ecosystem (Reader, Librarian, Admin) with search, filter &amp; sort.</li>
                      <li>Integrated Stripe payments with full delivery lifecycle tracking.</li>
                      <li>Implemented Better Auth and admin approval workflow for listings.</li>
                    </ul>
                    <p className="text-[11px] font-mono text-accent/70 mt-1">
                      Tech: Next.js, Tailwind CSS, HeroUI, Better Auth, Stripe.js, Recharts, Express.js, MongoDB
                    </p>
                  </div>

                  {/* Project 2 */}
                  <div className="p-4 rounded-xl border border-accent/50 bg-accent/5 backdrop-blur-sm flex flex-col gap-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h4 className="font-bold text-foreground text-base">Recipe Hut — AI-Powered Recipe Platform</h4>
                      <div className="flex items-center gap-2 text-xs font-mono text-accent">
                        <a href="https://recipe-hut-ai.vercel.app/" target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-1">Live <ExternalLink size={11} /></a>
                      </div>
                    </div>
                    <ul className="list-disc list-inside text-xs text-foreground/80 space-y-1">
                      <li>Built two agentic AI systems — Groq chat assistant &amp; Gemini pantry agent.</li>
                      <li>Implemented full-text search, filtering &amp; Recharts nutrition visualization.</li>
                      <li>Added full recipe CRUD with Better Auth login and GSAP animations.</li>
                    </ul>
                    <p className="text-[11px] font-mono text-accent/70 mt-1">
                      Tech: Next.js (App Router), TypeScript, Tailwind CSS, Better Auth, MongoDB Atlas, Groq &amp; Gemini APIs
                    </p>
                  </div>

                  {/* Project 3 */}
                  <div className="p-4 rounded-xl border border-accent/50 bg-accent/5 backdrop-blur-sm flex flex-col gap-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h4 className="font-bold text-foreground text-base">SpaceSync — Co-Working Booking Platform</h4>
                      <div className="flex items-center gap-2 text-xs font-mono text-accent">
                        <a href="https://spacesync-dev.vercel.app/" target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-1">Live <ExternalLink size={11} /></a>
                      </div>
                    </div>
                    <ul className="list-disc list-inside text-xs text-foreground/80 space-y-1">
                      <li>Engineered three-role system (User, Host, Admin) in typed TypeScript.</li>
                      <li>Built server-driven search, filtering &amp; pagination with request-based booking.</li>
                    </ul>
                    <p className="text-[11px] font-mono text-accent/70 mt-1">
                      Tech: Next.js 15, TypeScript, Tailwind CSS v4, Better Auth, GSAP, Recharts, Express.js, MongoDB Atlas
                    </p>
                  </div>
                </div>
              </div>

              {/* Progress Bar Style Languages */}
              <div className="flex flex-col gap-3">
                <span className="font-mono text-xs uppercase tracking-wider text-accent font-bold">Languages</span>
                <div className="flex flex-col gap-2 font-mono text-xs">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span>Bangla</span>
                      <span className="text-foreground/50">Native</span>
                    </div>
                    <div className="h-1.5 w-full bg-border/20 rounded-full overflow-hidden">
                      <div className="h-full bg-accent w-full" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span>English</span>
                      <span className="text-foreground/50">Intermediate</span>
                    </div>
                    <div className="h-1.5 w-full bg-border/20 rounded-full overflow-hidden">
                      <div className="h-full bg-accent w-[70%]" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span>Hindi</span>
                      <span className="text-foreground/50">Basic</span>
                    </div>
                    <div className="h-1.5 w-full bg-border/20 rounded-full overflow-hidden">
                      <div className="h-full bg-accent w-[40%]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 md:px-8 border-t border-border/30 bg-accent/[0.03] backdrop-blur-sm flex flex-wrap items-center justify-between gap-4 z-10">
              <div className="flex items-center gap-2">
                <a
                  href="https://github.com/lingkondash"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-accent/30 bg-accent/10 text-xs font-mono text-accent hover:bg-accent/20 transition-colors"
                >
                  <GiThunderBlade size={13} />
                  <span>GitHub</span>
                </a>
                <a
                  href="https://linkedin.com/in/lingkondash"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-accent/30 bg-accent/10 text-xs font-mono text-accent hover:bg-accent/20 transition-colors"
                >
                  <LiaLinkedin size={13} />
                  <span>LinkedIn</span>
                </a>
                <a
                  href="mailto:lingkondashdev@gmail.com"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-accent/30 bg-accent/10 text-xs font-mono text-accent hover:bg-accent/20 transition-colors"
                >
                  <Mail size={13} />
                  <span>Email</span>
                </a>
              </div>

              <a
                href="/resume.pdf"
                download
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent text-accent-foreground text-xs font-mono font-bold tracking-wider hover:bg-accent/90 transition-all active:scale-95 shadow-md shadow-accent/20"
              >
                <span>Resume</span>
                <Download size={14} />
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}