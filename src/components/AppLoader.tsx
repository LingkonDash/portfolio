"use client";

import React, { useState, useEffect } from "react";
import LoadingScreen from "./sections/LoadingScreen";

export default function AppLoader({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return children immediately on SSR to maintain SEO readability, 
    // or hide them using CSS until hydration. Standard is showing children or loading placeholder.
    // For portfolio layout, return a blank screen with background color during SSR.
    return (
      <div className="fixed inset-0 bg-[#0a0a0f]" />
    );
  }

  if (isLoading) {
    return <LoadingScreen onComplete={() => setIsLoading(false)} />;
  }

  return <>{children}</>;
}
