import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { UiIcon, type UiIconName } from "@/components/Icon";
import { TagPill } from "@/components/ProjectCard";
import { getAllProjects, getProjectBySlug } from "@/lib/content";
import { renderMdx } from "@/lib/mdx";

/** Pre-render one page per MDX file in content/projects at build time. */
export function generateStaticParams() {
  return getAllProjects().map(({ slug }) => ({ slug }));
}

// Unknown slugs return a 404 instead of being rendered on demand, so the site
// stays 100% static.
export const dynamicParams = false;

export async function generateMetadata({ params }: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) return {};
  return {
    title: project.title,
    description: project.description,
    openGraph: { title: project.title, description: project.description, type: "article" },
  };
}

export default async function ProjectPage({ params }: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) notFound();

  const content = await renderMdx(project.body);

  // Previous/next links, in the same newest-first order as the grid.
  const all = getAllProjects();
  const index = all.findIndex((p) => p.slug === slug);
  const newer = all[index - 1];
  const older = all[index + 1];

  const links: { href: string; label: string; icon: UiIconName; primary?: boolean }[] = [];
  if (project.liveUrl) links.push({ href: project.liveUrl, label: "Live site", icon: "arrow-up-right", primary: true });
  if (project.youtubeUrl) links.push({ href: project.youtubeUrl, label: "Watch the build", icon: "play", primary: !project.liveUrl });
  if (project.repoUrl) links.push({ href: project.repoUrl, label: "Source code", icon: "code" });

  const date = new Date(project.date).toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  return (
    <article className="relative">
      <div aria-hidden className="hero-glow pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px]" />

      <div className="mx-auto max-w-3xl px-4 pt-10 pb-24 sm:px-6 sm:pt-14">
        <Link
          href="/#projects"
          className="group inline-flex items-center gap-2 font-mono text-sm text-muted transition-colors hover:text-accent"
        >
          <UiIcon name="arrow-left" className="size-4 transition-transform group-hover:-translate-x-0.5" />
          cd ../projects
        </Link>

        <header className="mt-8">
          <p className="font-mono text-xs text-muted">
            <span className="text-accent">~/projects/</span>
            {project.slug}
            <span className="mx-2 text-line">·</span>
            <time dateTime={project.date}>{date}</time>
          </p>
          <h1 className="mt-3 font-mono text-3xl leading-tight font-extrabold tracking-tight text-heading sm:text-4xl">
            {project.title}
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-fg/80">{project.description}</p>

          <ul className="mt-6 flex flex-wrap gap-2" aria-label="Tech stack">
            {project.tags.map((tag) => (
              <TagPill key={tag} tag={tag} />
            ))}
          </ul>

          {links.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-3">
              {links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={
                    link.primary
                      ? "inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 font-mono text-sm font-semibold text-bg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-glow"
                      : "inline-flex items-center gap-2 rounded-lg border border-line bg-surface px-4 py-2.5 font-mono text-sm font-semibold text-heading transition-all duration-200 hover:-translate-y-0.5 hover:border-violet/60 hover:shadow-glow-violet"
                  }
                >
                  <UiIcon name={link.icon} className={`size-4 ${link.icon === "play" ? "fill-current" : ""}`} />
                  {link.label}
                </a>
              ))}
            </div>
          )}
        </header>

        <div className="relative mt-10 aspect-[16/9] overflow-hidden rounded-xl border border-line bg-surface shadow-2xl shadow-black/40">
          <Image
            src={project.thumbnail}
            alt={`${project.title} cover`}
            fill
            priority
            sizes="(min-width: 768px) 720px, 100vw"
            className="object-cover"
          />
        </div>

        {/* MDX write-up, compiled and syntax-highlighted at build time */}
        <div className="prose-cc prose mt-12 max-w-none prose-headings:scroll-mt-24 sm:prose-lg">
          {content}
        </div>

        {(newer || older) && (
          <nav
            aria-label="More projects"
            className="mt-16 grid gap-4 border-t border-line pt-8 sm:grid-cols-2"
          >
            {older ? (
              <Link
                href={`/projects/${older.slug}`}
                className="glow-border rounded-xl border border-line bg-surface p-4 transition-transform hover:-translate-y-0.5"
              >
                <span className="font-mono text-xs text-muted">← older</span>
                <span className="mt-1 block font-mono text-sm font-semibold text-heading">{older.title}</span>
              </Link>
            ) : (
              <span />
            )}
            {newer && (
              <Link
                href={`/projects/${newer.slug}`}
                className="glow-border rounded-xl border border-line bg-surface p-4 text-right transition-transform hover:-translate-y-0.5"
              >
                <span className="font-mono text-xs text-muted">newer →</span>
                <span className="mt-1 block font-mono text-sm font-semibold text-heading">{newer.title}</span>
              </Link>
            )}
          </nav>
        )}
      </div>
    </article>
  );
}
