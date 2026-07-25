export interface Project {
  slug: string;
  number: string;
  title: string;
  iconKey: "recipe-hut" | "book-hub" | "space-sync";
  description: string;
  longDescription: string;
  challenges?: string | null;
  futureImprovements?: string | null;
  liveUrl: string | null;
  repoUrl: string | null;
  images: string[];
  techStack: string[];
  order: number;
}

export interface Skill {
  id: string;
  name: string;
  iconUrl: string | null;
  iconFallback: string;
  description: string;
  order: number;
}

export interface Education {
  certificate: string;
  institution: string;
  background: string;
  passing_year: number;
  gpa: number;
}
