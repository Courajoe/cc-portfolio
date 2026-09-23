import Image from "next/image";
import Link from "next/link";

import { UiIcon } from "@/components/Icon";
import type { Project } from "@/lib/content";

/** Small pill badge for a tech tag. Reused on the project detail page. */
export function TagPill({ tag }: { tag: string }) {
  return (
    <li className="rounded-full border border-line bg-bg/60 px-2.5 py-0.5 font-mono text-[11px] text-fg/80">
      {tag}
    </li>
  );
}

export default function ProjectCard({ project }: { project: Project }) {
  const date = new Date(project.date).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });

  return (
    <article className="glow-border group relative flex flex-col overflow-hidden rounded-xl border border-line bg-surface transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_-24px_rgb(45_226_193/0.35)]">
      {/* Thumbnail */}
      <div className="relative aspect-[16/9] overflow-hidden border-b border-line bg-bg">
        <Image
          src={project.thumbnail}
          alt=""
          fill
          sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
        {project.youtubeUrl && (
          <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-bg/80 px-2 py-0.5 font-mono text-[10px] text-heading backdrop-blur">
            <span className="size-1.5 rounded-full bg-danger" /> on youtube
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="font-mono text-[11px] text-muted">
          <span className="text-accent">~/projects/</span>
          {project.slug}
          <span className="mx-1.5 text-line">·</span>
          {date}
        </p>

        <h3 className="mt-2 font-mono text-lg leading-snug font-bold text-heading">
          {/* The stretched link makes the whole card clickable. */}
          <Link
            href={`/projects/${project.slug}`}
            className="outline-none after:absolute after:inset-0 after:z-[2] after:content-['']"
          >
            {project.title}
          </Link>
        </h3>

        <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-fg/75">
          {project.description}
        </p>

        <ul className="mt-4 flex flex-wrap gap-1.5">
          {project.tags.slice(0, 5).map((tag) => (
            <TagPill key={tag} tag={tag} />
          ))}
        </ul>

        <p className="mt-5 inline-flex items-center gap-1.5 font-mono text-xs text-accent">
          read the write-up
          <UiIcon
            name="arrow-right"
            className="size-3.5 transition-transform duration-200 group-hover:translate-x-1"
          />
        </p>
      </div>
    </article>
  );
}
