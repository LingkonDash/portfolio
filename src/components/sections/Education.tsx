"use client";

import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CalendarDays } from "lucide-react";
import type { Education as EducationType } from "@/types/data";
import { ANIM_CONFIG } from "@/lib/animation-config";

gsap.registerPlugin(ScrollTrigger);

interface EducationProps {
  education: EducationType[];
}

function getShortTag(certificate: string) {
  const match = certificate.match(/\b([A-Z]{2,4})\b/);
  if (match?.[1]) return match[1];

  const words = certificate.split(/\s+/).filter(Boolean);
  if (!words.length) return "Edu";

  const firstWord = words[0].replace(/[^A-Za-z]/g, "");
  return firstWord.slice(0, 4).toUpperCase();
}

export default function Education({ education }: EducationProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!sectionRef.current) return;

    const heading = headingRef.current;
    const items = itemsRef.current.filter(Boolean) as HTMLDivElement[];

    if (!heading || !items.length) return;

    if (prefersReducedMotion) {
      gsap.set([heading, ...items], { opacity: 1, y: 0 });
      return;
    }

    const triggers: ScrollTrigger[] = [];

    const headingTrigger = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: "top bottom-=80",
      once: true,
      onEnter: () => {
        gsap.fromTo(
          heading,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: ANIM_CONFIG.duration, ease: ANIM_CONFIG.ease }
        );
      },
    });
    triggers.push(headingTrigger);

    items.forEach((item, index) => {
      const entryTrigger = ScrollTrigger.create({
        trigger: item,
        start: "top bottom-=90",
        once: true,
        onEnter: () => {
          gsap.fromTo(
            item,
            { opacity: 0, x: -12 },
            { opacity: 1, x: 0, duration: ANIM_CONFIG.duration, ease: ANIM_CONFIG.ease, delay: index * 0.08 }
          );
        },
      });
      triggers.push(entryTrigger);
    });

    return () => {
      triggers.forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <section id="education" ref={sectionRef} className="py-16 px-6 md:py-24 border-t border-border/10">
      <div className="max-w-5xl mx-auto w-full">
        <div ref={headingRef} className="mb-10 opacity-0 border-l-4 border-l-accent pl-4">
          <h2 className="text-2xl md:text-3xl font-black tracking-tight text-foreground">
            Educational <span className="text-accent">Qualification</span>
          </h2>
        </div>

        <div className="relative">
          <div className="space-y-6">
            {education.map((item, index) => (
              <div
                key={`${item.certificate}-${index}`}
                ref={(node) => {
                  itemsRef.current[index] = node;
                }}
                className="relative flex items-start gap-4 opacity-0"
              >
                <div className="relative z-10 mt-2 h-3 w-3 rounded-full border border-accent bg-accent shadow-[0_0_0_4px_rgba(56,189,248,0.15)]" />
                
                <div className="flex-1 min-w-0 rounded-lg border-l-4 border-l-accent border border-border/20 bg-accent/5 p-4 backdrop-blur-sm">
                  <span className="inline-flex items-center rounded-full border border-accent/30 bg-accent/15 px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-accent">
                    {getShortTag(item.certificate)}
                  </span>
                  <p className="mt-3 text-base md:text-lg font-semibold text-foreground">
                    {item.institution}
                  </p>
                  <div className="mt-3 flex items-center gap-2 text-sm text-foreground/70">
                    <CalendarDays size={14} className="text-accent/70" />
                    <span>{item.passing_year}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
