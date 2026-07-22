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

  window.scrollTo({
    top: Math.max(0, top),
    left: 0,
    behavior: options?.behavior ?? "smooth",
  });

  return true;
}

export function restoreScrollPosition() {
  if (typeof window === "undefined") return;
  if ("scrollRestoration" in window.history) {
    window.history.scrollRestoration = "manual";
  }

  const hash = window.location.hash;
  if (hash) {
    scrollToSection(hash, { behavior: "auto" });
    return;
  }

  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
}
