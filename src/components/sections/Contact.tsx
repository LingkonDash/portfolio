"use client";

import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  MessageCircle,
  Mail,
  MapPin,
  ArrowRight,
  ArrowLeft,
  Send,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import SocialLinks from "@/components/ui/SocialLinks";
import { ANIM_CONFIG } from "@/lib/animation-config";

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

export default function Contact() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const formContainerRef = useRef<HTMLDivElement>(null);
  const stepContainerRef = useRef<HTMLDivElement>(null);

  const [step, setStep] = useState<1 | 2 | 3 | "success" | "sending">(1);
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [error, setError] = useState("");
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    setPrefersReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  // 1. Scroll-triggered entrance animation for the section
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    if (prefersReducedMotion) {
      gsap.fromTo(
        el,
        { opacity: 0 },
        {
          opacity: 1,
          duration: ANIM_CONFIG.duration,
          ease: ANIM_CONFIG.ease,
          scrollTrigger: {
            trigger: el,
            start: "top bottom-=100",
            toggleActions: "play none none none",
          },
        }
      );
    } else {
      gsap.fromTo(
        el,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: ANIM_CONFIG.duration,
          ease: ANIM_CONFIG.ease,
          scrollTrigger: {
            trigger: el,
            start: "top bottom-=100",
            toggleActions: "play none none none",
          },
        }
      );
    }
  }, [prefersReducedMotion]);

  // 2. Step transition animations using GSAP
  useEffect(() => {
    const container = stepContainerRef.current;
    if (!container) return;

    if (prefersReducedMotion) {
      // Instant swap
      gsap.set(container, { opacity: 1, x: 0 });
    } else {
      gsap.fromTo(
        container,
        { opacity: 0, x: 20 },
        { opacity: 1, x: 0, duration: 0.4, ease: "power2.out" }
      );
    }
  }, [step, prefersReducedMotion]);

  // Form input validation helper
  const validateStep = (currentStep: typeof step): boolean => {
    setError("");
    if (currentStep === 1) {
      if (!formData.name.trim()) {
        setError("Please enter your name.");
        return false;
      }
    } else if (currentStep === 2) {
      if (!formData.email.trim()) {
        setError("Please enter your email.");
        return false;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError("Please enter a valid email address.");
        return false;
      }
    } else if (currentStep === 3) {
      if (!formData.message.trim()) {
        setError("Please type a message.");
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step === 1 ? 2 : 3);
    }
  };

  const handleBack = () => {
    setError("");
    setStep(step === 3 ? 2 : 1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (step === 1 || step === 2)) {
      // Prevent standard form submission & move to next step
      e.preventDefault();
      handleNext();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(3)) return;

    setStep("sending");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setStep("success");
        setFormData({ name: "", email: "", message: "" });
      } else {
        setError(data.error || "Something went wrong. Please try again.");
        setStep(3);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to connect to the server. Please try again later.");
      setStep(3);
    }
  };

  return (
    <section
      id="connect"
      ref={sectionRef}
      className="py-16 md:py-24 border-t border-border/10 select-none overflow-hidden"
    >
      <div className="max-w-5xl mx-auto px-4">
        {/* Title */}
        <h2 className="text-2xl md:text-3xl font-black tracking-tight text-foreground mb-12">
          Let's Connect
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Greeting & Location Map */}
          <div className="lg:col-span-5 flex flex-col gap-8">
            <div className="flex flex-col gap-4">
              <p className="text-base text-foreground/80 leading-relaxed font-sans">
                Have a project in mind or just want to say hi? I'd love to hear from you.
                Drop me a message, and I'll get back to you as soon as possible.
              </p>
            </div>

            {/* Contact Details */}
            <div className="flex flex-col gap-4 font-mono text-sm">
              <div className="flex items-center gap-3 text-foreground/75 hover:text-accent transition-colors duration-200">
                <Mail size={18} className="text-accent" />
                <a href="mailto:lingkondashdev@gmail.com" data-cursor="link">
                  lingkondashdev@gmail.com
                </a>
              </div>
              <div className="flex items-center gap-3 text-foreground/75">
                <MapPin size={18} className="text-accent" />
                <span>Sreemangal, Bangladesh</span>
              </div>
            </div>

            {/* Dark Space-themed Interactive Map Container */}
            <div className="relative rounded-2xl overflow-hidden border border-border/40 bg-background-elevated/30 p-2 shadow-xl">
              <iframe
                title="Sreemangal Location Map"
                src="https://maps.google.com/maps?q=Sreemangal&t=&z=13&ie=UTF8&iwloc=&output=embed"
                className="w-full h-48 rounded-xl border border-border/10 filter invert-[0.9] hue-rotate-[180deg] brightness-[0.9] contrast-[1.1] opacity-75"
                allowFullScreen
                loading="lazy"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 rounded-2xl border border-accent/10 pointer-events-none"
              />
            </div>

            {/* Social Links Row */}
            <SocialLinks className="mt-2 hidden" />
          </div>

          {/* Right Column: Stepped Glassmorphic Form Card */}
          <div className="lg:col-span-7" ref={formContainerRef}>
            <div className="relative bg-background-elevated/20 backdrop-blur-md border border-border/30 rounded-3xl p-8 shadow-2xl min-h-[340px] flex flex-col justify-between">
              {/* Step indicator */}
              {typeof step === "number" && (
                <div className="flex justify-between items-center mb-6">
                  <span className="font-mono text-xs text-muted/50 uppercase tracking-widest">
                    Step {step} of 3
                  </span>
                  <div className="flex gap-1.5">
                    {[1, 2, 3].map((s) => (
                      <div
                        key={s}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          s === step
                            ? "w-8 bg-accent"
                            : s < step
                            ? "w-3 bg-accent/40"
                            : "w-3 bg-border/40"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Form Input Steps */}
              <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="flex-1 flex flex-col justify-center">
                <div ref={stepContainerRef} className="flex-1 flex flex-col justify-center">
                  {step === 1 && (
                    <div className="flex flex-col gap-4">
                      <label htmlFor="name-input" className="text-xl font-bold text-foreground tracking-tight">
                        What's your name?
                      </label>
                      <input
                        id="name-input"
                        type="text"
                        placeholder="Type your name here..."
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-transparent border-b-2 border-border/40 focus:border-accent outline-none py-3 text-lg transition-colors font-sans placeholder-muted/30"
                      />
                    </div>
                  )}

                  {step === 2 && (
                    <div className="flex flex-col gap-4">
                      <label htmlFor="email-input" className="text-xl font-bold text-foreground tracking-tight">
                        What's your email address?
                      </label>
                      <input
                        id="email-input"
                        type="email"
                        autoFocus
                        placeholder="name@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full bg-transparent border-b-2 border-border/40 focus:border-accent outline-none py-3 text-lg transition-colors font-sans placeholder-muted/30"
                      />
                    </div>
                  )}

                  {step === 3 && (
                    <div className="flex flex-col gap-4">
                      <label htmlFor="message-input" className="text-xl font-bold text-foreground tracking-tight">
                        Write your message
                      </label>
                      <textarea
                        id="message-input"
                        autoFocus
                        rows={4}
                        placeholder="Tell me about your project, idea, or just say hi..."
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="w-full bg-transparent border border-border/40 focus:border-accent rounded-xl p-4 outline-none text-base transition-colors font-sans placeholder-muted/30 resize-none"
                      />
                    </div>
                  )}

                  {step === "sending" && (
                    <div className="flex flex-col items-center justify-center py-8 gap-4">
                      <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
                      <p className="font-mono text-sm text-muted/60">Transmitting message...</p>
                    </div>
                  )}

                  {step === "success" && (
                    <div className="flex flex-col items-center text-center justify-center py-6 gap-4">
                      <div className="p-3 bg-accent/10 border border-accent/20 rounded-full text-accent">
                        <CheckCircle2 size={36} />
                      </div>
                      <h3 className="text-2xl font-bold text-foreground tracking-tight">
                        Message Sent!
                      </h3>
                      <p className="text-sm text-foreground/70 max-w-sm font-sans">
                        I'll get back to you soon. Thank you for reaching out!
                      </p>
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        data-cursor="button"
                        className="mt-4 px-6 py-2.5 rounded-lg border border-border/40 hover:border-accent/40 bg-background-elevated/40 hover:bg-accent/10 text-foreground transition-all duration-200 text-sm font-bold font-mono"
                      >
                        Send Another Message
                      </button>
                    </div>
                  )}
                </div>

                {/* Validation/Error Message banner */}
                {error && typeof step === "number" && (
                  <div className="flex items-center gap-2 mt-4 text-rose-500 font-sans text-xs bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-lg">
                    <AlertCircle size={14} className="shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Navigation Row */}
                {typeof step === "number" && (
                  <div className="flex justify-between items-center mt-8 border-t border-border/10 pt-6">
                    <div>
                      {step > 1 && (
                        <button
                          type="button"
                          onClick={handleBack}
                          data-cursor="button"
                          className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wider uppercase text-muted hover:text-foreground transition-colors duration-200 py-2 px-3 -ml-3 rounded-lg"
                        >
                          <ArrowLeft size={14} />
                          Back
                        </button>
                      )}
                    </div>

                    <div>
                      {step < 3 ? (
                        <button
                          type="button"
                          onClick={handleNext}
                          data-cursor="button"
                          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-accent text-accent-foreground hover:opacity-90 font-bold text-sm tracking-wide transition-all shadow-md"
                        >
                          Next
                          <ArrowRight size={14} />
                        </button>
                      ) : (
                        <button
                          type="submit"
                          data-cursor="button"
                          className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-accent text-accent-foreground hover:opacity-90 font-bold text-sm tracking-wide transition-all shadow-md"
                        >
                          Send Message
                          <Send size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
