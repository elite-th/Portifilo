"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import type { LayoutMode } from "./types";
import { THOUGHTS } from "./thoughts-data";
import { useReducedMotion } from "./useReducedMotion";
import RawThought from "./RawThought";
import styles from "./ThoughtCluster.module.css";

/* =========================================================
 * Resonance Pairs (Design Spec §4.5)
 * Semantic connections between thought chips.
 * When both chips in a pair are in "trace" state,
 * a golden ley line beam pulses between them.
 * ========================================================= */
const RESONANCE_PAIRS: readonly [string, string][] = [
  ["t1", "t6"], // Taskino ↔ Meta (both Mode 2: Question→Answer)
  ["t2", "t5"], // Mind 2.0 ↔ Offline-First (both Mode 1: Blur→Type)
  ["t3", "t4"], // Humanities×Code ↔ Circadian (opposite sides, complementary)
] as const;

/* =========================================================
 * ThoughtCluster
 * --------------
 * Owns:
 *  - which thought is currently active (single-hover rule)
 *  - responsive LayoutMode (desktop / desktop-narrow / mobile)
 *    via useSyncExternalStore — no setState-in-effect.
 *  - auto-demo of the t4 (circadian) thought after mount
 *  - hint tooltip visibility (until first user interaction)
 *  - trace-count → reset affordance
 *
 * Loop-4 (Task 12 §2.5): the scatter field is now a transparent
 * absolute overlay covering the whole hero (see ThoughtCluster.module.css
 * — no z-index, pointer-events: none). Chips float on the ambient
 * background around the central textBlock rather than competing with
 * it as a card. On mobile it becomes a static 2-column grid below
 * the text.
 *
 * The cluster renders a single <section> + <ul> + <li> per thought.
 * Each <li> only carries semantic meaning; RawThought's <button>
 * owns its absolute position (so the t6 escaped override works).
 * ========================================================= */

const DESKTOP_MIN = 1180;
const NARROW_MIN = 1010;

const HINT_INTRO_DELAY = 600;
const HINT_AUTO_HIDE = 8000;
const AUTO_DEMO_DELAY = 1200;

/* =========================================================
 * Loop-8 (animation 1): entrance choreography — SCROLL-REVEAL CRYSTALLIZATION.
 *
 * Chips crystallize into view as they enter the viewport via IntersectionObserver.
 * Each chip has a custom delay based on its position in the choreography.
 *
 * Choreography order (t4 first — auto-demo target):
 *   t4 → t1 → t6 → t2 → t5 → t3
 *
 * The CSS handles the crystallizeIn animation via [data-scroll-revealed="true"]
 * with per-chip delays defined in globals.css.
 * ========================================================= */
const CHOREOGRAPHY_ORDER: readonly string[] = ["t4", "t1", "t6", "t2", "t5", "t3"];

// Scroll reveal thresholds
const SCROLL_REVEAL_THRESHOLD = 0.15; // 15% visible triggers crystallization
const SCROLL_REVEAL_ROOT_MARGIN = "0px 0px -10% 0px";

function computeLayout(width: number): LayoutMode {
  if (width >= DESKTOP_MIN) return "desktop";
  if (width >= NARROW_MIN) return "desktop-narrow";
  return "mobile";
}

/* ---------- Scroll-reveal subscription (IntersectionObserver) ---------- */

function subscribeScrollReveal(callback: () => void): () => void {
  const hero = document.getElementById("top");
  if (!hero) return () => {};

  if (typeof IntersectionObserver === "undefined") {
    callback();
    return () => {};
  }

  const io = new IntersectionObserver(
    (entries) => {
      if (entries[0]?.isIntersecting) {
        callback();
        io.disconnect();
      }
    },
    { threshold: SCROLL_REVEAL_THRESHOLD, rootMargin: SCROLL_REVEAL_ROOT_MARGIN }
  );

  io.observe(hero);
  return () => io.disconnect();
}

function getScrollRevealSnapshot(): boolean {
  const hero = document.getElementById("top");
  if (!hero) return false;
  const rect = hero.getBoundingClientRect();
  return rect.top < window.innerHeight * (1 - SCROLL_REVEAL_THRESHOLD) && rect.bottom > 0;
}

function getScrollRevealServerSnapshot(): boolean {
  return false;
}

/* ---------- Layout subscription (useSyncExternalStore) ---------- */

function subscribeLayout(callback: () => void): () => void {
  let frame = 0;
  let lastWidth = window.innerWidth;
  const onResize = (): void => {
    if (frame) return;
    frame = window.setTimeout(() => {
      frame = 0;
      const w = window.innerWidth;
      if (w !== lastWidth) {
        lastWidth = w;
        callback();
      }
    }, 150);
  };
  window.addEventListener("resize", onResize);
  return () => {
    if (frame) window.clearTimeout(frame);
    window.removeEventListener("resize", onResize);
  };
}

function getLayoutSnapshot(): LayoutMode {
  return computeLayout(window.innerWidth);
}

function getLayoutServerSnapshot(): LayoutMode {
  // SSR default — corrected on the client immediately.
  return "desktop";
}

/* ---------- Component ---------- */

export default function ThoughtCluster() {
  const reducedMotion = useReducedMotion();
  const layout = useSyncExternalStore(
    subscribeLayout,
    getLayoutSnapshot,
    getLayoutServerSnapshot
  );

  const [activeId, setActiveId] = useState<string | null>(null);
  const [hintVisible, setHintVisible] = useState<boolean>(false);
  const [traceIds, setTraceIds] = useState<Set<string>>(() => new Set());
  const [resetSignal, setResetSignal] = useState<number>(0);

  // Resonance beams state: which pairs have both chips in trace
  const [resonancePairs, setResonancePairs] = useState<Set<string>>(() => new Set());

  // When traceIds changes, update resonance pairs
  useEffect(() => {
    const newResonance = new Set<string>();
    RESONANCE_PAIRS.forEach(([id1, id2]) => {
      if (traceIds.has(id1) && traceIds.has(id2)) {
        newResonance.add(`${id1}-${id2}`);
      }
    });
    setResonancePairs(newResonance);
  }, [traceIds]);

  // Scroll-reveal state: chips crystallize when hero enters viewport
  const scrollRevealed = useSyncExternalStore(
    subscribeScrollReveal,
    getScrollRevealSnapshot,
    getScrollRevealServerSnapshot
  );
  const [enteredIds, setEnteredIds] = useState<Set<string>>(() => new Set());

  // When scrollRevealed becomes true, stagger the entrance of each chip
  useEffect(() => {
    if (!scrollRevealed || reducedMotion) return;

    const timers: ReturnType<typeof setTimeout>[] = CHOREOGRAPHY_ORDER.map(
      (id, index) =>
        setTimeout(() => {
          setEnteredIds((prev) => {
            if (prev.has(id)) return prev;
            const next = new Set(prev);
            next.add(id);
            return next;
          });
        }, index * 180)
    );
    return () => {
      timers.forEach((t) => clearTimeout(t));
    };
  }, [scrollRevealed, reducedMotion]);

  // Hint tooltip: appears shortly after mount, auto-hides after a few
  // seconds (or on first user activation, see handleActivate).
  useEffect(() => {
    const show = window.setTimeout(() => setHintVisible(true), HINT_INTRO_DELAY);
    const hide = window.setTimeout(
      () => setHintVisible(false),
      HINT_AUTO_HIDE
    );
    return () => {
      window.clearTimeout(show);
      window.clearTimeout(hide);
    };
  }, []);

  // Auto-demo: activate t4 shortly after mount. Deactivate after t4's
  // traceDuration so the chip can enter its trace phase naturally.
  useEffect(() => {
    if (reducedMotion) return; // skip auto-demo in reduced-motion mode
    const demo = THOUGHTS.find((t) => t.isAutoDemo);
    if (!demo) return;

    const activate = window.setTimeout(() => {
      // Only auto-activate if the user hasn't touched anything yet.
      setActiveId((prev) => (prev === null ? demo.id : prev));
    }, AUTO_DEMO_DELAY);

    const deactivate = window.setTimeout(
      () => {
        setActiveId((prev) => (prev === demo.id ? null : prev));
      },
      AUTO_DEMO_DELAY + demo.traceDuration
    );

    return () => {
      window.clearTimeout(activate);
      window.clearTimeout(deactivate);
    };
  }, [reducedMotion]);

  // --- Cluster-side activation handlers (passed to chips) -----------

  const handleActivate = useCallback((id: string) => {
    setActiveId((prev) => (prev === id ? prev : id));
    setHintVisible(false);
  }, []);

  const handleDeactivate = useCallback((id: string) => {
    setActiveId((prev) => (prev === id ? null : prev));
  }, []);

  const handleTraceChange = useCallback(
    (id: string, isTrace: boolean) => {
      setTraceIds((prev) => {
        const has = prev.has(id);
        if (isTrace && has) return prev;
        if (!isTrace && !has) return prev;
        const next = new Set(prev);
        if (isTrace) next.add(id);
        else next.delete(id);
        return next;
      });
    },
    []
  );

  const handleReset = useCallback(() => {
    setResetSignal((s) => s + 1);
  }, []);

  // Memoize the sr-only fallback paragraph content so it stays stable
  // across re-renders (it's static anyway).
  const srOnlySummary = useMemo(() => {
    return THOUGHTS.map((t) => `${t.label} — ${t.refined}`).join(" ");
  }, []);

  const traceCount = traceIds.size;
  const showReset = traceCount >= 3;

  return (
    <section
      className={styles.scatterField}
      data-layout={layout}
      data-mobile={layout === "mobile" ? "grid" : undefined}
      aria-label="فکرهای خام طاها حسینی"
    >
      <ul
        className={styles.thoughtList}
        role="list"
        data-mobile={layout === "mobile" ? "grid" : undefined}
      >
        {THOUGHTS.map((thought) => (
          <li className={styles.thoughtItem} key={thought.id}>
            <RawThought
              thought={thought}
              layout={layout}
              isActive={activeId === thought.id}
              onActivate={() => handleActivate(thought.id)}
              onDeactivate={() => handleDeactivate(thought.id)}
              onTraceChange={handleTraceChange}
              resetSignal={resetSignal}
              reducedMotion={reducedMotion}
              entered={reducedMotion ? scrollRevealed : enteredIds.has(thought.id)}
              scrollRevealed={scrollRevealed}
            />
          </li>
        ))}
      </ul>

      {/* Hint tooltip — visible until first user interaction. */}
      <span
        className={styles.hintTooltip}
        data-visible={hintVisible ? "true" : "false"}
        aria-hidden={!hintVisible}
      >
        روی هر فکر بزن تا پخته بشه ←
      </span>

      {/* Reset affordance — appears once ≥3 thoughts are in trace state. */}
      <button
        type="button"
        className={styles.resetButton}
        data-visible={showReset ? "true" : "false"}
        onClick={handleReset}
        aria-label="خام کردن همه‌ی فکرها"
        aria-hidden={!showReset}
        tabIndex={showReset ? 0 : -1}
      >
        ↺ خام
      </button>

      {/* sr-only SEO / screen-reader fallback (design spec §10.3). */}
      <p className="sr-only">
        فکرهای پخته‌شده‌ی طاها حسینی: {srOnlySummary}
      </p>

      {/* Resonance Beams (Ley Lines) — Design Spec §4.5 */}
      {resonancePairs.size > 0 && !reducedMotion && (
        <svg
          className={styles.resonanceLayer}
          aria-hidden="true"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            pointerEvents: "none",
            zIndex: 1,
          }}
        >
          {RESONANCE_PAIRS.map(([id1, id2]) => {
            const pairKey = `${id1}-${id2}`;
            const isActive = resonancePairs.has(pairKey);
            if (!isActive) return null;

            // Get chip elements to calculate positions
            const chip1 = document.querySelector(
              `[data-id="${id1}"]`
            ) as HTMLElement | null;
            const chip2 = document.querySelector(
              `[data-id="${id2}"]`
            ) as HTMLElement | null;

            if (!chip1 || !chip2) return null;

            const rect1 = chip1.getBoundingClientRect();
            const rect2 = chip2.getBoundingClientRect();

            const x1 = rect1.left + rect1.width / 2;
            const y1 = rect1.top + rect1.height / 2;
            const x2 = rect2.left + rect2.width / 2;
            const y2 = rect2.top + rect2.height / 2;

            const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
            const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);

            return (
              <line
                key={pairKey}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                className={styles.resonanceBeam}
                style={{
                  transformOrigin: `${x1}px ${y1}px`,
                  strokeWidth: 1,
                  strokeLinecap: "round",
                }}
              />
            );
          })}
        </svg>
      )}
    </section>
  );
}
