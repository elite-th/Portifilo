"use client";

import { useEffect, useState } from "react";

/**
 * useReducedMotion
 * ----------------
 * Tracks the user's `prefers-reduced-motion: reduce` setting and keeps
 * the value in React state. Returns `false` during SSR / first paint
 * (so server and client markup match), then updates after mount.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;

    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = (): void => setReduced(mql.matches);
    update();

    // Modern browsers: addEventListener("change", ...).
    // Older Safari: addListener.
    if (typeof mql.addEventListener === "function") {
      mql.addEventListener("change", update);
      return () => mql.removeEventListener("change", update);
    }
    // Legacy fallback (Safari < 14).
    mql.addListener(update);
    return () => mql.removeListener(update);
  }, []);

  return reduced;
}
