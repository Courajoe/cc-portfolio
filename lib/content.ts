/**
 * Content layer: every piece of site content lives in `content/` as JSON or MDX.
 *
 * These helpers run only on the server, at build time, because every page is
 * statically generated. There is no database and no runtime file access in
 * production. To add a project, drop a new `.mdx` file into `content/projects/`
 * and rebuild.
 */
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

import bioData from "@/content/bio.json";
import codingStackData from "@/content/coding-stack.json";
import aiStackData from "@/content/ai-stack.json";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type SocialLink = {
  label: string;
  /** Key understood by <Icon /> (e.g. "youtube", "github", "x"). */
  icon: string;
  url: string;
};

export type Bio = {
  name: string;
  handle: string;
  tagline: string;
  role: string;
  shortBio: string;
  longBio: string;
  email: string;
  location: string;
  profileImage: string;
  /** Optional Formspree form ID. Leave empty to hide the contact form. */
  formspreeId: string;
  socials: SocialLink[];
};

export type StackCategory = "Frontend" | "Backend" | "Infra";

/** How often a tool shows up in my work. Rendered as a 3-pip meter. */
export type StackLevel = "daily" | "production" | "familiar";

export type CodingStackItem = {
  name: string;
  category: StackCategory;
  icon: string;
  level: StackLevel;
};

export type AiStackItem = {
  name: string;
  category: string;
  icon: string;
  description: string;
  /** Short "how I use this" note shown in the toolbelt. */
  usage: string;
};

export type ProjectFrontmatter = {
  title: string;
  description: string;
  /** ISO date (YYYY-MM-DD), used for sorting newest-first. */
  date: string;
  tags: string[];
  thumbnail: string;
  liveUrl?: string;
  repoUrl?: string;
  youtubeUrl?: string;
  featured?: boolean;
};

export type Project = ProjectFrontmatter & {
  /** Derived from the file name: content/projects/<slug>.mdx */
  slug: string;
  /** Raw MDX body (frontmatter stripped), compiled on the detail page. */
  body: string;
};

/* ------------------------------------------------------------------ */
/* JSON content                                                        */
/* ------------------------------------------------------------------ */

export const bio = bioData as Bio;
export const codingStack = codingStackData as CodingStackItem[];
export const aiStack = aiStackData as AiStackItem[];

/** Display order for the coding stack groups. */
export const STACK_CATEGORIES: StackCategory[] = ["Frontend", "Backend", "Infra"];

export function getCodingStackByCategory() {
  return STACK_CATEGORIES.map((category) => ({
    category,
    items: codingStack.filter((item) => item.category === category),
  }));
}

/* ------------------------------------------------------------------ */
/* MDX projects                                                        */
/* ------------------------------------------------------------------ */

const PROJECTS_DIR = path.join(process.cwd(), "content", "projects");

function readProject(slug: string): Project {
  const file = fs.readFileSync(path.join(PROJECTS_DIR, `${slug}.mdx`), "utf8");
  const { data, content } = matter(file);
  return { ...(data as ProjectFrontmatter), slug, body: content };
}

/** All projects, newest first. */
export function getAllProjects(): Project[] {
  return fs
    .readdirSync(PROJECTS_DIR)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => readProject(file.replace(/\.mdx$/, "")))
    .sort((a, b) => +new Date(b.date) - +new Date(a.date));
}

export function getProjectBySlug(slug: string): Project | undefined {
  return getAllProjects().find((project) => project.slug === slug);
}

/** The most recent project, used for the hero's "latest project" CTA. */
export function getLatestProject(): Project | undefined {
  return getAllProjects()[0];
}
