/**
 * useLenis.ts
 *
 * Re-exports the `useLenis` hook provided by lenis/react so that any component
 * in the app can access the current Lenis instance or subscribe to scroll
 * events without prop-drilling.
 *
 * Usage — subscribe to scroll events:
 *   useLenis((lenis) => {
 *     console.log(lenis.progress); // 0..1
 *   })
 *
 * Usage — get the instance for programmatic scrollTo:
 *   const lenis = useLenis();
 *   lenis?.scrollTo('#hero', { duration: 1.2 });
 *
 * The hook works via the LenisContext provided by <ReactLenis root> in
 * SmoothScrollProvider. Components must be descendants of that provider.
 */

export { useLenis } from "lenis/react";
