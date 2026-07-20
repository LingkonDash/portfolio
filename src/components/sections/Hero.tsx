"use client";

import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import HeroCard from "@/components/three/HeroCard";

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const roleRef = useRef<HTMLDivElement>(null);
  const greetingRef = useRef<HTMLHeadingElement>(null);
  const buttonWrapperRef = useRef<HTMLDivElement>(null);
  const cardContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    
    // Set initial properties before entrance trigger
    if (!prefersReducedMotion) {
      gsap.set([roleRef.current, buttonWrapperRef.current], { opacity: 0, y: 15 });
      gsap.set(cardContainerRef.current, { opacity: 0, scale: 0.9, y: 20 });
      
      const greetingElement = greetingRef.current;
      if (greetingElement) {
        const text = greetingElement.textContent || "";
        const words = text.split(" ");
        greetingElement.innerHTML = "";
        
        words.forEach((word) => {
          const span = document.createElement("span");
          span.innerText = word + " ";
          span.style.display = "inline-block";
          span.style.opacity = "0";
          span.style.transform = "translateY(10px)";
          greetingElement.appendChild(span);
        });
      }
    }

    const t = setTimeout(() => {
      const tl = gsap.timeline();

      if (prefersReducedMotion) {
        // Instant transitions
        tl.to([roleRef.current, greetingRef.current, buttonWrapperRef.current, cardContainerRef.current], {
          opacity: 1,
          duration: 0.3,
          stagger: 0.05,
        });
      } else {
        // Smooth staggered reveal sequence
        tl.to(roleRef.current, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power3.out",
        });

        // Animate words inline
        const wordSpans = greetingRef.current?.querySelectorAll("span");
        if (wordSpans && wordSpans.length > 0) {
          tl.to(
            wordSpans,
            {
              opacity: 1,
              y: 0,
              duration: 0.45,
              stagger: 0.03,
              ease: "power2.out",
            },
            "-=0.4"
          );
        } else {
          // Fallback if formatting was missing
          tl.to(greetingRef.current, { opacity: 1, y: 0, duration: 0.5 }, "-=0.4");
        }

        // Show resume control and card wrapper
        tl.to(
          buttonWrapperRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            ease: "power3.out",
          },
          "-=0.3"
        );

        tl.to(
          cardContainerRef.current,
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.8,
            ease: "power4.out",
          },
          "-=0.4"
        );
      }
    }, 100);

    return () => clearTimeout(t);
  }, []);

  return (
    <section
      id="hero"
      ref={containerRef}
      className="min-h-[85vh] flex flex-col justify-center py-8 md:py-16 select-none"
    >
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center w-full">
        {/* Left Column: Text description and controls */}
        <div className="md:col-span-7 flex flex-col justify-center text-left gap-4 order-2 md:order-1">
          {/* Static / Simple role line */}
          <div
            ref={roleRef}
            className="text-xs md:text-sm font-mono tracking-widest text-accent uppercase font-bold"
          >
            Full Stack Developer | Next.js | React | Node.js | MongoDB | Building Scalable Web Apps
          </div>

          {/* Typing/staggered greeting intro */}
          <h1
            ref={greetingRef}
            className="text-3xl md:text-5xl font-black tracking-tight text-foreground leading-[1.1] min-h-[120px] md:min-h-[160px]"
          >
            Hi, I'm Lingkon Dash — a passionate Full Stack Developer building scalable, user-friendly web applications with clean, maintainable code.
          </h1>

          {/* Disabled Resume control wrapper */}
          <div ref={buttonWrapperRef} className="mt-4 flex">
            <button
              disabled
              data-cursor="button"
              className="px-6 py-3 rounded-lg bg-foreground/10 text-foreground/40 border border-foreground/10 font-sans text-sm font-bold uppercase tracking-wider cursor-not-allowed select-none transition-colors"
            >
              Resume Coming Soon
            </button>
          </div>
        </div>

        {/* Right Column: 3D profile container */}
        <div
          ref={cardContainerRef}
          className="md:col-span-5 flex justify-center items-center order-1 md:order-2"
        >
          <HeroCard />
        </div>
      </div>
    </section>
  );
}
