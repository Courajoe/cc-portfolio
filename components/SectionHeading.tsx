type SectionHeadingProps = {
  /** Two-digit section index, e.g. "01". */
  index: string;
  /** Fake shell command shown above the title, e.g. "ls ./stack". */
  command: string;
  title: string;
  description?: string;
  /** Accent colour for the prompt line. */
  tone?: "accent" | "violet";
};

/** Consistent terminal-flavoured heading used by every landing-page section. */
export default function SectionHeading({
  index,
  command,
  title,
  description,
  tone = "accent",
}: SectionHeadingProps) {
  return (
    <header className="mb-10 max-w-2xl sm:mb-12">
      <p className="mb-3 font-mono text-xs tracking-wide text-muted sm:text-sm">
        <span className={tone === "violet" ? "text-violet" : "text-accent"}>{index}</span>
        <span className="mx-2 text-line">/</span>
        <span className={tone === "violet" ? "text-violet" : "text-accent"}>$</span> {command}
      </p>
      <h2 className="font-mono text-3xl font-bold tracking-tight text-heading sm:text-4xl">
        {title}
      </h2>
      {description && <p className="mt-4 text-base leading-relaxed text-muted">{description}</p>}
    </header>
  );
}
