import Link from "next/link";

import HeroBackground from "@/components/HeroBackground";
import Terminal from "@/components/Terminal";
import { UiIcon } from "@/components/Icon";
import { bio, getLatestProject } from "@/lib/content";

const youtube = bio.socials.find((s) => s.icon === "youtube");

export default function Hero() {
  const latest = getLatestProject();

  // "Building real products with AI, on camera" gets a gradient on the part
  // after the last comma, so the tagline stays editable in bio.json.
  const commaAt = bio.tagline.lastIndexOf(",");
  const [lead, emphasis] =
    commaAt === -1
      ? [bio.tagline, ""]
      : [bio.tagline.slice(0, commaAt + 1), bio.tagline.slice(commaAt + 1)];

  return (
    // Deliberately not a stacking context (no `isolate`/z-index here): the
    // fixed WebGL layer must share main's stacking context, so it sits at z-0
    // below *every* section (all z-10), not just the hero.
    <section className="relative">
      {/* Static gradient glow (CSS) + interactive WebGL layer (client-only) */}
      <div aria-hidden className="hero-glow pointer-events-none absolute inset-0 -z-10" />
      <HeroBackground />

      <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-12 px-4 pt-14 pb-24 sm:px-6 sm:pt-20 lg:min-h-[calc(100dvh-4rem)] lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:py-16">
        <div>
          <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-line bg-surface/60 px-3 py-1 font-mono text-xs text-muted backdrop-blur">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-60" />
              <span className="relative inline-flex size-2 rounded-full bg-accent" />
            </span>
            {bio.role.toLowerCase()}
          </p>

          <p className="font-mono text-sm text-accent">$ whoami</p>
          <h1 className="mt-2 font-mono text-[2.6rem] leading-none font-extrabold tracking-tighter text-heading sm:text-6xl lg:text-7xl">
            {bio.name}
          </h1>
          <p className="mt-6 text-2xl leading-snug font-semibold tracking-tight text-heading sm:text-3xl">
            {lead}
            {emphasis && <span className="text-gradient whitespace-nowrap">{emphasis}</span>}
          </p>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-fg/80 sm:text-lg">
            {bio.shortBio}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            {youtube && (
              <a
                href={youtube.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-3 font-mono text-sm font-semibold text-bg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-glow"
              >
                <UiIcon name="play" className="size-4 fill-current" />
                Watch on YouTube
              </a>
            )}
            {latest && (
              <Link
                href={`/projects/${latest.slug}`}
                className="group inline-flex items-center gap-2 rounded-lg border border-line bg-surface/70 px-5 py-3 font-mono text-sm font-semibold text-heading backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:border-violet/60 hover:shadow-glow-violet"
              >
                Latest project
                <UiIcon
                  name="arrow-right"
                  className="size-4 transition-transform group-hover:translate-x-0.5"
                />
              </Link>
            )}
          </div>

          <ul className="mt-10 flex flex-wrap gap-x-5 gap-y-2 font-mono text-xs text-muted">
            {["claude-code", "codex", "next.js", "postgres", "dokploy"].map((tag) => (
              <li key={tag}>
                <span className="text-accent/70">#</span>
                {tag}
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:animate-float">
          <Terminal />
        </div>
      </div>
    </section>
  );
}
