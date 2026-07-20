/**
 * AppLoader.tsx
 *
 * Previously: mounted a full-screen LoadingScreen that blocked all page content
 * until drei's useProgress hit 100%.
 *
 * Now: the loading experience lives in app/loading.tsx, which Next.js handles
 * automatically via its Suspense boundary. AppLoader is kept as a thin pass-
 * through wrapper so the layout import doesn't need to change — it can be
 * removed entirely in a later cleanup phase if desired.
 */

export default function AppLoader({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
