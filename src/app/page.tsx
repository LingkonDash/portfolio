import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Education from "@/components/sections/Education";
import Skills from "@/components/sections/Skills";
import Projects from "@/components/sections/Projects";
import Contact from "@/components/sections/Contact";
import Footer from "@/components/sections/Footer";
import { getEducation, getProjects, getSkills } from "@/lib/data";

export default async function Home() {
  const projects = await getProjects();
  const skills = await getSkills();
  const education = await getEducation();

  return (
    <div className="relative min-h-screen flex flex-col pt-20">
      {/* Main content sections */}
      <main className="flex-1 flex flex-col gap-12 max-w-7xl mx-auto w-full px-4 my-8">
        <Hero />
        <About />
        <Skills skills={skills} />
        <Projects projects={projects} />
        <Education education={education} />
        <Contact />
      </main>

      <Footer />
    </div>
  );
}

