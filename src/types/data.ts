export interface Project {
  slug: string;
  number: string;
  title: string;
  iconKey: "recipe-hut" | "book-hub" | "space-sync";
  description: string;
  longDescription: string;
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
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  description: string;
}
