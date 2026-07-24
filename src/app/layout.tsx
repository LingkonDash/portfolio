import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import CustomCursor from "@/components/ui/CustomCursor";
import AppLoader from "@/components/AppLoader";
import StarBackground from "@/components/sections/StarBackground";
import Navbar from "@/components/sections/Navbar";
import InitialScrollReset from "@/components/InitialScrollReset";
import BackToTopButton from "@/components/ui/BackToTopButton";
import "./globals.css";

// TODO: Swap in a custom font here if desired.
const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Lingkon Dash | Full Stack Developer (MERN)",
  description:
    "Full Stack Developer specializing in Next.js, React, Node.js, and MongoDB. Building scalable, user-friendly web applications with clean, maintainable code.",
  openGraph: {
    title: "Lingkon Dash | Full Stack Developer (MERN)",
    description:
      "Full Stack Developer specializing in Next.js, React, Node.js, and MongoDB. Building scalable, user-friendly web applications with clean, maintainable code.",
    type: "website",
    // TODO: Add actual og:image URL in Phase 2
    // images: [{ url: '/images/og-image.png', width: 1200, height: 630, alt: 'Lingkon Dash Portfolio' }]
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full font-sans bg-background text-foreground flex flex-col transition-colors duration-300">
        <ThemeProvider
          attribute="data-theme"
          defaultTheme="void"
          enableSystem={false}
          value={{
            void: "void",
            nebula: "nebula",
            solstice: "solstice",
            aurora: "aurora",
            eclipse: "eclipse",
          }}
        >
          {/* Star particle background — fixed, z-index:0, behind all content. */}
          <StarBackground />

          {/* Custom cursor — also position:fixed, same reasoning as above */}
          <CustomCursor />

          <InitialScrollReset />

          {/* Navbar is in layout so it renders on all routes (homepage + /projects/[slug] etc.) */}
          <Navbar />
          <AppLoader>
            {children}
          </AppLoader>
          <BackToTopButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
