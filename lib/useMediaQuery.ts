"use client";

import { useSyncExternalStore } from "react";

/**
 * Subscribe to a CSS media query. The server has no window, so it uses
 * `serverValue` (rendered during SSR and hydration), and the client switches
 * to the real value right after.
 */
export function useMediaQuery(query: string, serverValue = false): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => serverValue,
  );
}

/** True when the visitor asked the OS to minimise animation. */
export function usePrefersReducedMotion(serverValue = false) {
  return useMediaQuery("(prefers-reduced-motion: reduce)", serverValue);
}
