import type { CSSProperties } from "react";

import { BrandIcon, brandColor } from "@/components/Icon";
import SectionHeading from "@/components/SectionHeading";
import { getCodingStackByCategory, type StackCategory, type StackLevel } from "@/lib/content";

// Each category gets its own left-border colour so the groups scan quickly.
const CATEGORY_STYLE: Record<StackCategory, { color: string; label: string }> = {
  Frontend: { color: "#2DE2C1", label: "ui, styling, rendering" },
  Backend: { color: "#8B5CF6", label: "apis, data, logic" },
  Infra: { color: "#7DD3FC", label: "servers, containers, deploys" },
};

const LEVELS: Record<StackLevel, { pips: number; label: string }> = {
  daily: { pips: 3, label: "daily driver" },
  production: { pips: 2, label: "shipped to prod" },
  familiar: { pips: 1, label: "familiar" },
};

function LevelMeter({ pips, color }: { pips: number; color: string }) {
  return (
    <span aria-hidden className="flex shrink-0 items-center gap-1">
      {[1, 2, 3].map((n) => (
        <span
          key={n}
          className="h-1.5 w-3 rounded-full"
          style={{ background: n <= pips ? color : "var(--color-line)" }}
        />
      ))}
    </span>
  );
}

export default function StackGrid() {
  const groups = getCodingStackByCategory();

  return (
    <section id="stack" className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
      <SectionHeading
        index="01"
        command="ls ./coding-stack"
        title="Coding Stack"
        description="The tools I actually ship with. It's a boring, proven stack that runs on a VPS I control."
      />

      <div className="grid gap-10 lg:grid-cols-3 lg:gap-6">
        {groups.map(({ category, items }) => {
          const style = CATEGORY_STYLE[category];
          return (
            <div key={category}>
              <h3 className="mb-4 flex items-baseline gap-3 font-mono text-sm">
                <span style={{ color: style.color }}>{category.toLowerCase()}/</span>
                <span className="text-xs text-muted">{`// ${style.label}`}</span>
              </h3>

              <ul className="space-y-3">
                {items.map((item) => {
                  const level = LEVELS[item.level];
                  return (
                    <li
                      key={item.name}
                      // --cat drives the border and glow; --brand tints the icon on hover.
                      style={{ "--cat": style.color, "--brand": brandColor(item.icon) } as CSSProperties}
                      className="group flex items-center gap-4 rounded-lg border border-l-2 border-line border-l-(--cat) bg-surface px-4 py-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_30px_-12px_var(--cat)]"
                    >
                      <span className="grid size-9 shrink-0 place-items-center rounded-md bg-bg/70 text-fg/70 ring-1 ring-line transition-colors duration-200 group-hover:text-(--brand)">
                        <BrandIcon name={item.icon} className="size-[18px]" />
                      </span>
                      <span className="min-w-0 flex-1 truncate font-mono text-sm text-heading">
                        {item.name}
                      </span>
                      <span className="sr-only">{level.label}</span>
                      <span title={level.label}>
                        <LevelMeter pips={level.pips} color={style.color} />
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>

      {/* Legend for the pip meter */}
      <p className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-xs text-muted">
        {Object.values(LEVELS).map((l) => (
          <span key={l.label} className="flex items-center gap-2">
            <LevelMeter pips={l.pips} color="var(--color-muted)" />
            {l.label}
          </span>
        ))}
      </p>
    </section>
  );
}
