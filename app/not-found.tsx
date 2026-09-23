import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto flex max-w-2xl flex-col items-start px-4 py-32 sm:px-6">
      <div className="w-full overflow-hidden rounded-xl border border-line bg-surface font-mono text-sm">
        <div className="flex items-center gap-2 border-b border-line px-4 py-3">
          <span className="size-3 rounded-full bg-[#ff5f57]" />
          <span className="size-3 rounded-full bg-[#febc2e]" />
          <span className="size-3 rounded-full bg-[#28c840]" />
        </div>
        <div className="space-y-1 p-5 leading-7">
          <p>
            <span className="text-accent">➜</span> <span className="text-violet">~</span>{" "}
            <span className="text-muted">$</span> cd ./this-page
          </p>
          <p className="text-danger">bash: cd: ./this-page: No such file or directory (404)</p>
          <p>
            <span className="text-accent">➜</span> <span className="text-violet">~</span>{" "}
            <span className="text-muted">$</span>{" "}
            <span className="inline-block h-4 w-2 translate-y-0.5 animate-blink bg-accent" />
          </p>
        </div>
      </div>
      <Link
        href="/"
        className="mt-8 rounded-lg bg-accent px-5 py-3 font-mono text-sm font-semibold text-bg transition-all hover:-translate-y-0.5 hover:shadow-glow"
      >
        cd ~
      </Link>
    </section>
  );
}
