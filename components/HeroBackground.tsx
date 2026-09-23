"use client";

import dynamic from "next/dynamic";
import { Component, useEffect, useRef, type ReactNode } from "react";

import { useMediaQuery, usePrefersReducedMotion } from "@/lib/useMediaQuery";

/**
 * Client-only wrapper for the WebGL background (a globe that spins as you scroll).
 *
 * - Three.js needs `window` and a WebGL context, so the scene is lazy-loaded
 *   with `ssr: false`. That option only works inside a Client Component, which
 *   is why this wrapper exists instead of calling dynamic() from the Hero.
 * - Nothing mounts (and three.js is never downloaded) when the visitor prefers
 *   reduced motion.
 * - Small or touch screens get a "lite" globe: fewer dots and a lower pixel
 *   ratio. Scrolling works the same everywhere, so no mouse is needed.
 * - The layer is fixed, full-viewport and pointer-events: none, so it can never
 *   block a click or a scroll. It fades back as you scroll past the hero.
 */
const EarthScene = dynamic(() => import("@/components/EarthScene"), { ssr: false });

export default function HeroBackground() {
  // Server snapshot `true` means SSR renders nothing, and the client decides.
  const reducedMotion = usePrefersReducedMotion(true);
  const lite = useMediaQuery("(max-width: 767px), (hover: none)");
  const layer = useRef<HTMLDivElement>(null);

  // Fade the layer over the first screen of scrolling, so it recedes behind
  // the content sections while still spinning.
  useEffect(() => {
    if (reducedMotion) return;
    const max = lite ? 0.6 : 1; // keep it subtler behind stacked mobile text
    const min = 0.3;
    let frame = 0;
    const update = () => {
      const progress = Math.min(1, window.scrollY / (window.innerHeight * 0.9));
      if (layer.current) layer.current.style.opacity = String(max - progress * (max - min));
    };
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, [reducedMotion, lite]);

  if (reducedMotion) return null;

  return (
    <div ref={layer} aria-hidden className="pointer-events-none fixed inset-0 z-0">
      <div className="size-full animate-[scene-in_1.6s_ease-out_both]">
        <SceneErrorBoundary>
          <EarthScene lite={lite} />
        </SceneErrorBoundary>
      </div>
    </div>
  );
}

/**
 * If WebGL is unavailable (old GPU, disabled hardware acceleration), fail
 * silently. The CSS gradient glow behind the hero still looks good on its own.
 */
class SceneErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}
