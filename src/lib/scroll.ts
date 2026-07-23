import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

export const NAVBAR_SCROLL_OFFSET = 80;

export function normalizeHash(target: string) {
  if (!target) return "";
  return target.startsWith("#") ? target : `#${target}`;
}

export function scrollToSection(
  target: string,
  options?: { offset?: number; behavior?: ScrollBehavior }
): boolean {
  if (typeof window === "undefined") return false;

  const hash = normalizeHash(target);
  const element = document.querySelector(hash);
  if (!element) return false;

  const offset = options?.offset ?? NAVBAR_SCROLL_OFFSET;
  const top = element.getBoundingClientRect().top + window.scrollY - offset;
  const duration = options?.behavior === "smooth" ? 0.9 : 0.01;

  gsap.to(window, {
    duration,
    scrollTo: { y: top, offsetY: offset },
    ease: "power2.inOut",
  });

  return true;
}

