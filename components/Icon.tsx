/**
 * Icons.
 *
 * - <BrandIcon name="docker" /> renders a logo from `simple-icons` using the
 *   icon keys in the content JSON files. The few tools missing from
 *   simple-icons fall back to hand-drawn glyphs.
 * - <UiIcon name="arrow-right" /> renders small stroke icons for buttons and links.
 *
 * Everything renders on the server as inline SVG, so no icon font or client
 * JavaScript is shipped.
 */
import type { SVGProps } from "react";
import {
  siAnthropic,
  siClaude,
  siContabo,
  siDocker,
  siGithub,
  siModelcontextprotocol,
  siMysql,
  siNextdotjs,
  siNodedotjs,
  siPhp,
  siPostgresql,
  siPrisma,
  siTailwindcss,
  siTypescript,
  siX,
  siYoutube,
  type SimpleIcon,
} from "simple-icons";

const BRANDS: Record<string, SimpleIcon> = {
  anthropic: siAnthropic,
  claude: siClaude,
  contabo: siContabo,
  docker: siDocker,
  github: siGithub,
  modelcontextprotocol: siModelcontextprotocol,
  mysql: siMysql,
  nextdotjs: siNextdotjs,
  nodedotjs: siNodedotjs,
  php: siPhp,
  postgresql: siPostgresql,
  prisma: siPrisma,
  tailwindcss: siTailwindcss,
  typescript: siTypescript,
  x: siX,
  youtube: siYoutube,
};

/** Hand-drawn 24×24 fallbacks for tools that aren't in simple-icons. */
const CUSTOM_PATHS: Record<string, { d: string; hex: string }> = {
  // Codex: a terminal prompt ">_" inside a hexagon.
  codex: {
    d: "M12 1.5 21.1 6.75v10.5L12 22.5 2.9 17.25V6.75L12 1.5Zm0 2.31L4.9 7.9v8.2L12 20.19l7.1-4.09V7.9L12 3.81ZM7.3 9.2l3.3 2.8-3.3 2.8-1.03-1.22L8.15 12 6.27 10.42 7.3 9.2Zm4.7 4.8h5.2v1.6H12V14Z",
    hex: "10A37F",
  },
  // Dokploy: stacked deploy layers with an upward arrow.
  dokploy: {
    d: "M12 2 3 6.5l9 4.5 9-4.5L12 2Zm-7.2 8.6L3 11.5 12 16l9-4.5-1.8-.9L12 14.2l-7.2-3.6Zm0 5L3 16.5 12 21l9-4.5-1.8-.9L12 19.2l-7.2-3.6Z",
    hex: "7C9CFF",
  },
};

/** Brand colours that are too dark to read on our background get lifted. */
function readableHex(hex: string) {
  const n = parseInt(hex, 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.35 ? "#E6EDF3" : `#${hex}`;
}

/** Brand colour for an icon key, for hover tints and glows. */
export function brandColor(name: string): string {
  const hex = BRANDS[name]?.hex ?? CUSTOM_PATHS[name]?.hex;
  return hex ? readableHex(hex) : "#2DE2C1";
}

type IconProps = SVGProps<SVGSVGElement> & { name: string; title?: string };

export function BrandIcon({ name, title, ...props }: IconProps) {
  const d = BRANDS[name]?.path ?? CUSTOM_PATHS[name]?.d;
  if (!d) return null;
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      {...props}
    >
      {title ? <title>{title}</title> : null}
      <path d={d} />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* UI icons (stroke-based, 24×24)                                      */
/* ------------------------------------------------------------------ */

const UI_PATHS = {
  "arrow-right": "M5 12h14M13 6l6 6-6 6",
  "arrow-left": "M19 12H5M11 18l-6-6 6-6",
  "arrow-up-right": "M7 17 17 7M8 7h9v9",
  external: "M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5",
  mail: "M4 6h16v12H4zM4 7l8 6 8-6",
  play: "M8 5.5v13l10.5-6.5L8 5.5Z",
  code: "m9 8-4 4 4 4M15 8l4 4-4 4",
  send: "M4 12 20 4l-6 16-3-7-7-1Z",
  check: "M5 12.5 10 17 19 7",
  terminal: "M5 8l4 4-4 4M12 16h7",
} as const;

export type UiIconName = keyof typeof UI_PATHS;

export function UiIcon({
  name,
  ...props
}: SVGProps<SVGSVGElement> & { name: UiIconName }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      <path d={UI_PATHS[name]} />
    </svg>
  );
}
