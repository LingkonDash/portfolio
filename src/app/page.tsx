import Navbar from "@/components/sections/Navbar";
import StarField from "@/components/sections/StarField";
import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Skills from "@/components/sections/Skills";
import Projects from "@/components/sections/Projects";
import Contact from "@/components/sections/Contact";

export default function Home() {
  return (
    <div className="relative min-h-screen flex flex-col pt-20">
      {/* Global utility & effect placeholders */}
      <StarField />
      
      {/* Header / Navigation */}
      <Navbar />

      {/* Main content sections */}
      <main className="flex-1 flex flex-col gap-12 max-w-4xl mx-auto w-full px-4 my-8">
        <Hero />
        <About />
        <Skills />
        <Projects />
        <Contact />
      </main>
    </div>
  );
}
