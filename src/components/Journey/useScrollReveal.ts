"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { useReducedMotion } from "@/components/Hero/useReducedMotion";

/* =========================================================
 * useScrollReveal — shared scroll-reveal hook
 * ---------------------------------------------------------
 * Contract (Task 34-A integration with Worker B):
 *   export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
 *     options?: { threshold?: number; rootMargin?: string; once?: boolean }
 *   ): { ref: React.RefObject<T>; revealed: boolean }
 *
 * Behavior:
 *   - Returns a `ref` to attach to the element you want to reveal.
 *   - On mount, an IntersectionObserver watches the element.
 *   - When the element enters the viewport (per threshold + rootMargin),
 *     `revealed` flips to true and `data-revealed="true"` is set on
 *     `ref.current` so CSS can transition via `[data-revealed="true"]`.
 *   - `once: true` (default) — observer disconnects after first reveal.
 *     `once: false` — observer stays attached and `revealed` toggles
 *     both ways as the element enters/leaves.
 *   - SSR-safe: first render returns `revealed = false` and a ref whose
 *     current is null. The observer only attaches on the client.
 *   - prefers-reduced-motion: reduce → `revealed` is forced to true
 *     immediately on mount (no animation needed; CSS still gets the
 *     data-revealed attribute). This is done via a *derived* value
 *     (`reducedMotion || revealed`) so we never call setState
 *     synchronously inside the effect body (avoids the React 19
 *     `react-hooks/set-state-in-effect` lint rule).
 *   - Cleanup: observer.disconnect() on unmount or option change.
 *
 * Worker B imports this from `@/components/Journey/useScrollReveal`
 * for Synthesis + Projects. The hook signature above is the stable
 * contract — do not change it without coordinating.
 * ========================================================= */

export interface UseScrollRevealOptions {
  /** IntersectionObserver threshold. Default 0.15. */
  threshold?: number;
  /** IntersectionObserver rootMargin. Default "0px 0px -10% 0px". */
  rootMargin?: string;
  /** If true (default), observer disconnects after first reveal. */
  once?: boolean;
}

export interface UseScrollRevealResult<T extends HTMLElement> {
  ref: RefObject<T | null>;
  revealed: boolean;
}

export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
  options?: UseScrollRevealOptions
): UseScrollRevealResult<T> {
  const {
    threshold = 0.15,
    rootMargin = "0px 0px -10% 0px",
    once = true,
  } = options ?? {};

  const ref = useRef<T>(null);
  const [revealed, setRevealed] = useState<boolean>(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    // SSR guard — only run on the client.
    if (typeof window === "undefined") return;

    const el = ref.current;
    if (!el) return;

    // prefers-reduced-motion: set the data attribute only. The
    // `revealed` boolean is derived (reducedMotion || revealed)
    // in the return value, so no setState is needed here.
    if (reducedMotion) {
      el.setAttribute("data-revealed", "true");
      return;
    }

    // IntersectionObserver is available in all browsers Next.js 16
    // targets. If a very old browser lacks it, content stays visible
    // because CSS `[data-reveal]` is only used by Worker B; the
    // Journey sections rely on `[data-revealed]` which we set
    // unconditionally below as a fallback for the no-observer case.
    if (typeof IntersectionObserver === "undefined") {
      el.setAttribute("data-revealed", "true");
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setRevealed(true);
            el.setAttribute("data-revealed", "true");
            if (once) {
              observer.disconnect();
            }
          } else if (!once) {
            setRevealed(false);
            el.removeAttribute("data-revealed");
          }
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, once, reducedMotion]);

  // Derived: reduced-motion users see the revealed state immediately.
  return { ref, revealed: reducedMotion || revealed };
}

export default useScrollReveal;
