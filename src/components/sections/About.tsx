"use client";

import Image from "next/image";
import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Terminal, Code, Database } from "lucide-react";
import { ANIM_CONFIG } from "@/lib/animation-config";

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

export default function About() {
  const containerRef = useRef<HTMLDivElement>(null);
  const photoRef = useRef<HTMLDivElement>(null);
  const photoRingRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const listItemsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Organic shape blob slow float animation
    let floatTween: gsap.core.Tween;
    let ringRotateTween: gsap.core.Tween;

    if (!prefersReducedMotion && photoRef.current) {
      const innerBlob = photoRef.current.querySelector(".organic-blob");
      if (innerBlob) {
        floatTween = gsap.to(innerBlob, {
          y: -10,
          rotate: 3,
          duration: 3.5,
          repeat: -1,
          yoyo: true,
          ease: "power1.inOut",
        });
      }
    }

    if (!prefersReducedMotion && photoRingRef.current) {
      ringRotateTween = gsap.to(photoRingRef.current, {
        rotate: 360,
        duration: 28,
        repeat: -1,
        ease: "none",
        transformOrigin: "50% 50%",
      });
    }

    // Scroll Trigger reveals
    const triggers: ScrollTrigger[] = [];

    if (prefersReducedMotion) {
      // Instant reveal
      gsap.set([photoRef.current, textRef.current, listItemsRef.current], { opacity: 1 });
    } else {
      // Photo reveal
      if (photoRef.current) {
         const photoTrigger = ScrollTrigger.create({
          trigger: photoRef.current,
          start: "top bottom-=80",
          onEnter: () => {
            gsap.fromTo(
              photoRef.current,
              { opacity: 0, scale: 0.95 },
              { opacity: 1, scale: 1, duration: ANIM_CONFIG.duration, ease: ANIM_CONFIG.ease }
            );
          },
        });
        triggers.push(photoTrigger);
      }

      // Text block reveal (paragraph by paragraph)
      if (textRef.current) {
        const paragraphs = textRef.current.querySelectorAll(".reveal-text");
        const textTrigger = ScrollTrigger.create({
          trigger: textRef.current,
          start: "top bottom-=80",
          onEnter: () => {
            gsap.fromTo(
              paragraphs,
              { opacity: 0, y: 20 },
              { opacity: 1, y: 0, duration: ANIM_CONFIG.duration, stagger: ANIM_CONFIG.stagger, ease: ANIM_CONFIG.ease }
            );
          },
        });
        triggers.push(textTrigger);
      }

      // Bullets reveal
      if (listItemsRef.current) {
        const items = listItemsRef.current.querySelectorAll(".reveal-item");
        const itemsTrigger = ScrollTrigger.create({
          trigger: listItemsRef.current,
          start: "top bottom-=80",
          onEnter: () => {
            gsap.fromTo(
              items,
              { opacity: 0, x: -15 },
              { opacity: 1, x: 0, duration: ANIM_CONFIG.duration, stagger: 0.1, ease: ANIM_CONFIG.ease }
            );
          },
        });
        triggers.push(itemsTrigger);
      }
    }

    return () => {
      if (floatTween) floatTween.kill();
      if (ringRotateTween) ringRotateTween.kill();
      triggers.forEach((t) => t.kill());
    };
  }, []);

  return (
    <section
      id="about"
      ref={containerRef}
      className="py-16 px-6 md:py-24 max-w-5xl mx-auto w-full flex flex-col justify-center border-t border-border/10 select-none"
    >
      <div className="grid grid-cols-1 gap-12 items-center w-full">
        {/* Profile photo centered at top */}
        <div
          ref={photoRef}
          className="flex justify-center opacity-0"
        >
          <div
            data-cursor="card"
            className="organic-blob relative w-64 h-64 md:w-80 md:h-80 bg-background-elevated/30 border-2 border-dashed border-accent/40 rounded-[30%_70%_70%_30%_/_30%_30%_70%_70%] overflow-hidden shadow-2xl transition-colors duration-300"
          >
            <div className="absolute inset-0">
              <Image
                src="/images/avatar2.jpg"
                alt="Lingkon Dash portrait"
                fill
                sizes="(max-width: 640px) 85vw, 400px"
                className="object-cover rounded-[30%_70%_70%_30%_/_30%_30%_70%_70%] pointer-events-none"
              />
            </div>

            <div
              ref={photoRingRef}
              className="absolute inset-0 rounded-[30%_70%_70%_30%_/_30%_30%_70%_70%] border border-dashed border-accent/40 pointer-events-none"
            />

            <div className="absolute inset-0 bg-radial from-accent/8 via-transparent to-transparent opacity-30 pointer-events-none" />
          </div>
        </div>

        {/* About details underneath */}
        <div ref={textRef} className="flex flex-col gap-6 text-left">
          <h2 className="reveal-text text-2xl md:text-3xl font-black tracking-tight text-foreground opacity-0 border-l-4 border-l-accent pl-4">
            About <span className="text-accent">Me</span>
          </h2>

          <div className="flex flex-col gap-6 text-base md:text-lg text-foreground/90 leading-loose font-sans">
            <p className="reveal-text opacity-0">
              Hi, I'm Lingkon Dash. I am a passionate Full Stack Web Developer with hands-on experience building scalable, user-friendly web applications using MongoDB, Express.js, Next.js, and Node.js. My focus is on writing clean, maintainable code and crafting intuitive, user-centric interfaces.
            </p>
            
            <p className="reveal-text opacity-0">
              I have a solid foundation in JavaScript, REST APIs, Git, and Tailwind CSS, and I enjoy the challenge of turning complex logic into functional, production-ready projects. Whether it's building interactive features or structuring scalable backend systems, I am driven by continuous learning and problem-solving.
            </p>
          </div>

          {/* List items block */}
          <div ref={listItemsRef} className="flex flex-col gap-5 mt-4">
            <h3 className="text-sm md:text-[0.88rem] font-mono uppercase tracking-wider text-accent font-bold">
              What I bring to the table:
            </h3>

            <div className="grid grid-cols-1 gap-4 font-sans">
              {/* Bullet 1 */}
              <div className="reveal-item flex gap-3 items-start text-base text-foreground/90 opacity-0">
                <div className="mt-0.5 p-2 rounded-2xl bg-accent/10 text-accent shadow-[0_0_12px_rgba(56,189,248,0.11)]">
                  <Code size={18} />
                </div>
                <div className="leading-relaxed">
                  <strong className="text-foreground font-semibold">Frontend Development:</strong>{" "}
                  Building dynamic, responsive user interfaces with React and Tailwind CSS.
                </div>
              </div>

              {/* Bullet 2 */}
              <div className="reveal-item flex gap-3 items-start text-base text-foreground/90 opacity-0">
                <div className="mt-0.5 p-2 rounded-2xl bg-accent/10 text-accent shadow-[0_0_12px_rgba(56,189,248,0.11)]">
                  <Terminal size={18} />
                </div>
                <div className="leading-relaxed">
                  <strong className="text-foreground font-semibold">JavaScript & Problem-Solving:</strong>{" "}
                  Sharpening my logic through consistent practice on LeetCode.
                </div>
              </div>

              {/* Bullet 3 */}
              <div className="reveal-item flex gap-3 items-start text-base text-foreground/90 opacity-0">
                <div className="mt-0.5 p-2 rounded-2xl bg-accent/10 text-accent shadow-[0_0_12px_rgba(56,189,248,0.11)]">
                  <Database size={18} />
                </div>
                <div className="leading-relaxed">
                  <strong className="text-foreground font-semibold">Backend Fundamentals:</strong>{" "}
                  Working with Node.js, Express, and MongoDB to power full-stack applications.
                </div>
              </div>
            </div>
          </div>

          <p className="reveal-text text-base md:text-lg text-foreground/90 leading-loose font-sans mt-4 opacity-0">
            I have recently completed my learning journey and worked on several production-level projects. I am highly motivated, disciplined, and currently open for work — looking for remote frontend or junior/mid-level full-stack roles where I can grow, contribute, and build impactful web projects.
          </p>
        </div>
      </div>
    </section>
  );
}
