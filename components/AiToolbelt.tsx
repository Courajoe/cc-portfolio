import type { CSSProperties } from "react";

import { BrandIcon, brandColor } from "@/components/Icon";
import SectionHeading from "@/components/SectionHeading";
import { aiStack } from "@/lib/content";

/**
 * The AI stack is what sets the channel apart, so it's styled differently from
 * the coding stack on purpose: one gradient-ringed "toolbelt" panel with
 * scanlines and a status bar, where each tool reads like a loaded module with
 * a "how I use it" comment.
 */
export default function AiToolbelt() {
  return (
    <section id="ai" className="relative py-24">
      {/* Violet wash that sets this section apart from its neighbours */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-1/2 -z-10 h-[80%] -translate-y-1/2 bg-[radial-gradient(50%_50%_at_50%_50%,rgb(139_92_246/0.13),transparent_70%)]"
      />

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          index="02"
          tone="violet"
          command="cat ~/.toolbelt"
          title="AI Stack"
          description="The part most tutorials skip: the AI tools I build with every day, and where each one fits in my workflow."
        />

        <div className="gradient-ring overflow-hidden rounded-2xl shadow-[0_30px_80px_-30px_rgb(139_92_246/0.45)]">
          {/* Status bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-surface/80 px-5 py-3 font-mono text-xs">
            <span className="text-muted">
              <span className="text-violet">●</span> toolbelt.config
            </span>
            <span className="text-muted">
              <span className="text-accent">{aiStack.length}</span> tools loaded
              <span className="mx-2 text-line">|</span>
              status: <span className="text-accent">ready</span>
            </span>
          </div>

          <ul className="grid gap-px bg-line/70 sm:grid-cols-2">
            {aiStack.map((tool, i) => (
              <li
                key={tool.name}
                style={{ "--brand": brandColor(tool.icon) } as CSSProperties}
                className="scanlines group relative bg-bg p-6 transition-colors duration-300 hover:bg-surface/60 sm:p-7"
              >
                {/* Brand-tinted glow that fades in on hover */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{
                    background:
                      "radial-gradient(60% 80% at 0% 0%, color-mix(in srgb, var(--brand) 14%, transparent), transparent 70%)",
                  }}
                />

                <div className="relative flex items-start gap-4">
                  <span className="grid size-12 shrink-0 place-items-center rounded-xl border border-line bg-surface text-(--brand) shadow-[0_0_24px_-6px_var(--brand)] transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6">
                    <BrandIcon name={tool.icon} className="size-6" />
                  </span>

                  <div className="min-w-0">
                    <p className="font-mono text-[11px] tracking-wider text-muted uppercase">
                      {String(i + 1).padStart(2, "0")} · {tool.category}
                    </p>
                    <h3 className="mt-1 font-mono text-lg font-bold text-heading">{tool.name}</h3>
                  </div>
                </div>

                <p className="relative mt-4 text-sm leading-relaxed text-fg/85">{tool.description}</p>

                <p className="relative mt-4 rounded-md border border-line/80 bg-surface/60 px-3 py-2.5 font-mono text-xs leading-relaxed">
                  <span className="text-accent">{"// how I use it: "}</span>
                  <span className="text-fg/75">{tool.usage}</span>
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
