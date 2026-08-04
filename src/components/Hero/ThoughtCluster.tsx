"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
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
const HINT_AUTO_HIDE = 16_000;
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

  // Beam endpoints — measured in layout effect (FIX-9), not in render.
  // Coordinates are field-relative so the SVG layer (absolute inside the
  // scatter field) shares the chips' coordinate space; recomputed on resize.
  const [beams, setBeams] = useState<{
    key: string;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  }[]>([]);

  useLayoutEffect(() => {
    if (reducedMotion || resonancePairs.size === 0) {
      setBeams([]);
      return;
    }
    const measure = () => {
      const field = fieldRef.current;
      if (!field) return;
      const fieldRect = field.getBoundingClientRect();
      const next: typeof beams = [];
      RESONANCE_PAIRS.forEach(([id1, id2]) => {
        const pairKey = `${id1}-${id2}`;
        if (!resonancePairs.has(pairKey)) return;
        const c1 = chipEls.current.get(id1);
        const c2 = chipEls.current.get(id2);
        if (!c1 || !c2) return;
        const r1 = c1.getBoundingClientRect();
        const r2 = c2.getBoundingClientRect();
        next.push({
          key: pairKey,
          x1: r1.left - fieldRect.left + r1.width / 2,
          y1: r1.top - fieldRect.top + r1.height / 2,
          x2: r2.left - fieldRect.left + r2.width / 2,
          y2: r2.top - fieldRect.top + r2.height / 2,
        });
      });
      setBeams(next);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [reducedMotion, resonancePairs]);

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

  // --- Shared eyefish listener (FIX-8) ----------------------------------
  // One window mousemove listener + one rAF per frame, instead of six
  // per-chip listeners each calling getBoundingClientRect on every move.
  // Chip DOM nodes register here via onRegister; rects are cached and
  // recomputed only on resize/scroll. Reads `data-state` from the DOM so
  // non-raw chips (overridden by their state CSS) are skipped.
  const fieldRef = useRef<HTMLElement | null>(null);
  const chipEls = useRef(new Map<string, HTMLButtonElement>());

  const registerChip = useCallback((id: string, el: HTMLButtonElement | null) => {
    if (el) chipEls.current.set(id, el);
    else chipEls.current.delete(id);
  }, []);

  useEffect(() => {
    if (reducedMotion || layout === "mobile") return;
    const els = chipEls.current;
    const rects = new Map<string, { cx: number; cy: number }>();
    const pointer = { x: 0, y: 0 };
    let raf = 0;
    let rectsDirty = true;
    const MAX_DIST = 400;

    const measure = () => {
      rectsDirty = false;
      for (const [id, el] of els) {
        const r = el.getBoundingClientRect();
        rects.set(id, { cx: r.left + r.width / 2, cy: r.top + r.height / 2 });
      }
    };

    const applyFish = () => {
      raf = 0;
      if (rectsDirty) measure();
      for (const [id, el] of els) {
        if (el.dataset.state !== "raw") continue;
        const c = rects.get(id);
        if (!c) continue;
        const dx = pointer.x - c.cx;
        const dy = pointer.y - c.cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const t = Math.max(0, 1 - dist / MAX_DIST);
        el.style.setProperty("--fish-scale", `${0.85 + t * t * 0.33}`);
        el.style.setProperty("--fish-blur", `${(1 - t) * 2}px`);
        el.style.setProperty("--fish-opacity", `${0.55 + t * 0.45}`);
      }
    };

    const onMove = (e: MouseEvent) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      if (!raf) raf = requestAnimationFrame(applyFish);
    };

    const invalidateRects = () => {
      rectsDirty = true;
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("resize", invalidateRects);
    window.addEventListener("scroll", invalidateRects, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", invalidateRects);
      window.removeEventListener("scroll", invalidateRects);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [reducedMotion, layout]);

  // Memoize the sr-only fallback paragraph content so it stays stable
  // across re-renders (it's static anyway).
  const srOnlySummary = useMemo(() => {
    return THOUGHTS.map((t) => `${t.label} — ${t.refined}`).join(" ");
  }, []);

  const traceCount = traceIds.size;
  const showReset = traceCount >= 3;

  return (
    <section
      ref={fieldRef}
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
              onRegister={(el) => registerChip(thought.id, el)}
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

      {/* Resonance Beams (Ley Lines) — Design Spec §4.5.
          SVG is absolute inside the scatter field so it shares the chips'
          coordinate space; endpoints come from `beams` state (FIX-9). */}
      {beams.length > 0 && (
        <svg
          className={styles.resonanceLayer}
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
          }}
        >
          {beams.map((b) => (
            <line
              key={b.key}
              x1={b.x1}
              y1={b.y1}
              x2={b.x2}
              y2={b.y2}
              className={styles.resonanceBeam}
              style={{
                transformOrigin: `${b.x1}px ${b.y1}px`,
                strokeWidth: 1,
                strokeLinecap: "round",
              }}
            />
          ))}
        </svg>
      )}
    </section>
  );
}
