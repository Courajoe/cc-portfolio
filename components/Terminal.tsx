"use client";

import { useEffect, useState } from "react";

import { usePrefersReducedMotion } from "@/lib/useMediaQuery";

/**
 * Fake macOS terminal with a typing animation.
 *
 * Commands are typed one character at a time; output lines appear after a
 * short delay. The server renders the empty terminal, and the animation
 * starts after hydration. With prefers-reduced-motion it jumps straight to the
 * final state. Screen readers get the full transcript via a visually hidden
 * copy, and the animated version is aria-hidden.
 */

type Line =
  | { kind: "cmd"; text: string }
  | { kind: "out"; text: string; tone?: "ok" | "muted" | "rec" | "link" };

const SCRIPT: Line[] = [
  { kind: "cmd", text: "npx create-courajoe-app my-saas" },
  { kind: "out", text: "Scaffolding Next.js 16 + Tailwind", tone: "ok" },
  { kind: "out", text: "Pairing with Claude Code + Codex", tone: "ok" },
  { kind: "out", text: "Plugging in MCP tools", tone: "ok" },
  { kind: "out", text: "Deploying to Dokploy via Nixpacks", tone: "ok" },
  { kind: "out", text: "live → https://my-saas.dev", tone: "link" },
  { kind: "out", text: "REC  episode saved for YouTube", tone: "rec" },
  { kind: "cmd", text: "git push && ship-it --on-camera" },
];

const TYPE_MIN_MS = 35;
const TYPE_JITTER_MS = 55;
const AFTER_CMD_MS = 450;
const BETWEEN_OUTPUT_MS = 380;
const START_DELAY_MS = 600;

export default function Terminal() {
  const reducedMotion = usePrefersReducedMotion();

  // How many lines are fully shown, and how far into the current line we are.
  const [typedLine, setLine] = useState(0);
  const [char, setChar] = useState(0);
  const [started, setStarted] = useState(false);

  // Reduced motion: skip straight to the finished transcript.
  const line = reducedMotion ? SCRIPT.length : typedLine;
  const done = line >= SCRIPT.length;

  // Short pause after hydration before typing starts.
  useEffect(() => {
    if (reducedMotion) return;
    const t = setTimeout(() => setStarted(true), START_DELAY_MS);
    return () => clearTimeout(t);
  }, [reducedMotion]);

  // Advance the script one step at a time.
  useEffect(() => {
    if (!started || done) return;
    const current = SCRIPT[line];
    let t: ReturnType<typeof setTimeout>;

    if (current.kind === "cmd" && char < current.text.length) {
      t = setTimeout(() => setChar((c) => c + 1), TYPE_MIN_MS + Math.random() * TYPE_JITTER_MS);
    } else {
      const delay = current.kind === "cmd" ? AFTER_CMD_MS : BETWEEN_OUTPUT_MS;
      t = setTimeout(() => {
        setLine((l) => l + 1);
        setChar(0);
      }, delay);
    }
    return () => clearTimeout(t);
  }, [started, done, line, char]);

  return (
    <div className="glow-border w-full overflow-hidden rounded-xl border border-line bg-surface/45 shadow-2xl shadow-black/40 backdrop-blur-[3px]">
      {/* Title bar */}
      <div className="flex items-center gap-2 border-b border-line bg-surface-2/60 px-4 py-3">
        <span className="size-3 rounded-full bg-[#ff5f57]" />
        <span className="size-3 rounded-full bg-[#febc2e]" />
        <span className="size-3 rounded-full bg-[#28c840]" />
        <span className="ml-3 font-mono text-xs text-muted">courajoe@studio: ~/projects</span>
      </div>

      {/* Screen-reader transcript */}
      <p className="sr-only">
        Terminal demo:{" "}
        {SCRIPT.map((l) => (l.kind === "cmd" ? `$ ${l.text}. ` : `${l.text}. `)).join("")}
      </p>

      {/* Animated output */}
      <div
        aria-hidden
        className="min-h-[19rem] px-4 py-4 font-mono text-[13px] leading-7 sm:min-h-[20rem] sm:px-5 sm:text-sm"
      >
        {SCRIPT.slice(0, line).map((l, i) => (
          <TerminalLine key={i} line={l} />
        ))}

        {!done && SCRIPT[line].kind === "cmd" && (
          <div>
            <Prompt />
            <span className="text-heading">{SCRIPT[line].text.slice(0, char)}</span>
            <Cursor />
          </div>
        )}

        {/* Idle prompt: waits between outputs and after the script ends */}
        {(done || SCRIPT[line].kind === "out") && (
          <div>
            {done && <Prompt />}
            <Cursor />
          </div>
        )}
      </div>
    </div>
  );
}

function Prompt() {
  return (
    <>
      <span className="text-accent">➜</span> <span className="text-violet">~</span>{" "}
      <span className="text-muted">$</span>{" "}
    </>
  );
}

function Cursor() {
  return <span className="inline-block h-[1.1em] w-[0.55em] translate-y-[0.2em] animate-blink bg-accent" />;
}

function TerminalLine({ line }: { line: Line }) {
  if (line.kind === "cmd") {
    return (
      <div>
        <Prompt />
        <span className="text-heading">{line.text}</span>
      </div>
    );
  }
  switch (line.tone) {
    case "ok":
      return (
        <div className="text-fg">
          <span className="text-accent">✔</span> {line.text}
        </div>
      );
    case "link":
      return (
        <div className="text-fg">
          <span className="text-violet">▲</span> <span className="text-accent underline decoration-accent/40 underline-offset-4">{line.text}</span>
        </div>
      );
    case "rec":
      return (
        <div className="text-fg">
          <span className="mr-1 inline-block size-2 -translate-y-px animate-pulse rounded-full bg-danger" />{" "}
          {line.text}
        </div>
      );
    default:
      return <div className="text-muted">{line.text}</div>;
  }
}
