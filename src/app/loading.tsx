/**
 * app/loading.tsx
 * Next.js file-based loading convention (App Router).
 *
 * This file is automatically shown by Next.js inside a React Suspense boundary
 * while the route segment below it is loading (e.g. during navigation or when
 * a Server Component is streaming). Next.js controls when it mounts/unmounts —
 * no manual onComplete callback needed here.
 *
 * The LoadingScreen component (with the 3D LD monogram, GSAP fly-through, and
 * progress counter) is reused as-is. The GSAP animation still plays; the overlay
 * simply fades out naturally when Next.js removes it after the page is ready.
 */

export default function Loading() {
  return null;
}
