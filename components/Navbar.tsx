"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

// "/#id" (not just "#id") so the links also work from /projects/[slug].
const NAV_LINKS = [
  { href: "/#stack", label: "stack" },
  { href: "/#ai", label: "ai" },
  { href: "/#projects", label: "projects" },
  { href: "/#contact", label: "contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  // Add a background and border once the page scrolls under the nav.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 transition-colors duration-300 ${
        scrolled || open
          ? "border-b border-line/80 bg-bg/75 backdrop-blur-md"
          : "border-b border-transparent"
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="group font-mono text-sm font-semibold text-heading"
          onClick={() => setOpen(false)}
        >
          <span className="text-accent">~/</span>
          codercourajoe
          <span className="ml-0.5 inline-block h-4 w-2 translate-y-0.5 animate-blink bg-accent" />
        </Link>

        {/* Desktop links */}
        <ul className="hidden items-center gap-1 font-mono text-sm sm:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="rounded-md px-3 py-1.5 text-muted transition-colors hover:bg-surface hover:text-accent"
              >
                <span className="text-violet/80">./</span>
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Mobile toggle */}
        <button
          type="button"
          className="rounded-md border border-line px-3 py-1.5 font-mono text-xs text-fg sm:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "close" : "menu"}
        </button>
      </nav>

      {open && (
        <ul id="mobile-nav" className="space-y-1 px-4 pb-4 font-mono text-sm sm:hidden">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                onClick={() => setOpen(false)}
                className="block rounded-md px-3 py-2 text-fg hover:bg-surface hover:text-accent"
              >
                <span className="text-accent">$ cd</span> {link.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </header>
  );
}
