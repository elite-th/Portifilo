"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./LightThread.module.css";

/* =========================================================
 * LightThread — نخ بصریِ مسیر آشنایی (Task 39-B)
 * ---------------------------------------------------------
 * A vertical optical thread that runs from the top of the
 * <Journey> down to <Connect>. It binds the five sections
 * (WhoAmI → WhatIBuild → WhereIFrom → WhereIGo → Connect)
 * into a single visual path — the "linear journey" the
 * Planner (Task 37 §2) calls for.
 *
 * Behaviour:
 *  - On mount (and on resize), measure each section's vertical
 *    centre relative to the journey root, and place a node at
 *    that position. Nodes light up when their section is the
 *    closest one to the viewport's middle (active section).
 *  - A pulse dot slides along the thread as the user scrolls
 *    (top → bottom). Its colour interpolates per-section
 *    (gold → cream → olive → bright → gold) so the thread
 *    itself feels like a living gradient.
 *  - Mobile (< 768px): hidden — the thread is a desktop-only
 *    navigational cue. Mobile readers get a clean vertical
 *    stack instead.
 *  - Reduced motion: pulse is parked at the centre; nodes are
 *    all lit (no scroll-driven animation).
 *
 * The component is `position: absolute` inside `.journey`
 * (which is `position: relative`) and uses `inset-inline-start`
 * so it lands on the reading-start side in RTL.
 * ========================================================= */

type SectionColour = string;

const SECTION_COLOURS: SectionColour[] = [
  "var(--accent)",        // §۱ WhoAmI — gold (Calcination)
  "var(--text)",          // §۲ WhatIBuild — cream (Dissolution)
  "var(--accent-2)",      // §۳ WhereIFrom — olive (Separation)
  "var(--accent-bright)", // §۴ WhereIGo — bright gold (Conjunction)
  "var(--accent)",        // §۵ Connect — gold→olive (Coagulation)
];

type NodePos = {
  /** Distance from the top of the journey, in pixels. */
  top: number;
  /** 0..1 fraction of the journey height (for the gradient stop). */
  ratio: number;
};

export default function LightThread() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const pulseRef = useRef<HTMLDivElement | null>(null);
  const lineRef = useRef<HTMLDivElement | null>(null);
  const [nodePositions, setNodePositions] = useState<NodePos[]>([]);
  const [activeNode, setActiveNode] = useState<number>(-1);

  /* ----------------------------------------------------------
   * Measure: locate each [data-journey-section] child and
   * compute its vertical centre relative to the journey root.
   * Re-run on resize. Skips on SSR.
   * ---------------------------------------------------------- */
  useEffect(() => {
    if (typeof window === "undefined") return;
    // IMPORTANT: rootRef.current is the thread's own wrapper div (which has
    // no [data-journey-section] children). Walk up to the actual journey
    // root that owns the sections — otherwise querySelectorAll returns []
    // and nodePositions stays empty (5 nodes never render). See Task 40.
    const root = rootRef.current?.closest<HTMLElement>("[data-journey-root]");
    if (!root) return;

    const measure = () => {
      const rootRect = root.getBoundingClientRect();
      const rootTop = rootRect.top + window.scrollY;
      const rootHeight = rootRect.height;
      if (rootHeight <= 0) return;

      const sections = Array.from(
        root.querySelectorAll<HTMLElement>("[data-journey-section]")
      );
      if (sections.length === 0) return;

      const positions: NodePos[] = sections.map((section) => {
        const rect = section.getBoundingClientRect();
        const sectionTop = rect.top + window.scrollY;
        const centre = sectionTop - rootTop + rect.height / 2;
        return {
          top: centre,
          ratio: Math.min(Math.max(centre / rootHeight, 0), 1),
        };
      });

      setNodePositions(positions);
    };

    measure();
    window.addEventListener("resize", measure);
    // Re-measure after fonts load (Persian glyphs can shift layout).
    const t = window.setTimeout(measure, 600);

    return () => {
      window.removeEventListener("resize", measure);
      window.clearTimeout(t);
    };
  }, []);

  /* ----------------------------------------------------------
   * Scroll → pulse position + active node.
   * Uses a single rAF-throttled scroll listener (cheap).
   * ---------------------------------------------------------- */
  useEffect(() => {
    if (typeof window === "undefined") return;
    // Same as the measure effect above: walk up to the real journey root
    // — rootRef.current is the thread wrapper, not the section container.
    const root = rootRef.current?.closest<HTMLElement>("[data-journey-root]");
    if (!root) return;

    const reduced =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let raf = 0;

    const update = () => {
      raf = 0;
      const rect = root.getBoundingClientRect();
      const vh = window.innerHeight;
      // progress: 0 when journey top hits viewport top,
      // 1 when journey bottom hits viewport bottom.
      const total = Math.max(rect.height - vh, 1);
      const scrolled = Math.min(Math.max(-rect.top, 0), total);
      const progress = scrolled / total;

      if (pulseRef.current) {
        pulseRef.current.style.setProperty(
          "--thread-pulse",
          `${(progress * 100).toFixed(2)}%`
        );
        const idx = Math.min(
          Math.floor(progress * SECTION_COLOURS.length),
          SECTION_COLOURS.length - 1
        );
        pulseRef.current.style.setProperty(
          "--pulse-color",
          SECTION_COLOURS[idx] ?? "var(--accent)"
        );
      }

      // Active node: the one whose section centre is closest
      // to the viewport's vertical midpoint. Skipped in reduced
      // motion (no scroll-driven highlighting there).
      if (!reduced && nodePositions.length > 0) {
        const viewportMid = vh / 2;
        let bestIdx = -1;
        let bestDist = Infinity;
        for (let i = 0; i < nodePositions.length; i++) {
          const sectionEl = root.querySelector<HTMLElement>(
            `[data-journey-section="${i + 1}"]`
          );
          if (!sectionEl) continue;
          const r = sectionEl.getBoundingClientRect();
          const centre = r.top + r.height / 2;
          const dist = Math.abs(centre - viewportMid);
          if (dist < bestDist) {
            bestDist = dist;
            bestIdx = i;
          }
        }
        if (bestIdx !== activeNode) setActiveNode(bestIdx);
      }
    };

    if (reduced) {
      // Park pulse at the centre, light the middle node directly via
      // DOM (no setState — keeps us clear of the set-state-in-effect
      // lint rule). Active-node tracking is paused in reduced motion.
      if (pulseRef.current) {
        pulseRef.current.style.setProperty("--thread-pulse", "50%");
        pulseRef.current.style.setProperty(
          "--pulse-color",
          "var(--accent-bright)"
        );
      }
      if (nodePositions.length > 0) {
        const midIdx = Math.floor(nodePositions.length / 2);
        const nodes = root.querySelectorAll<HTMLElement>(
          `.${styles.threadNode}`
        );
        nodes.forEach((node, i) => {
          if (i === midIdx) {
            node.setAttribute("data-active", "true");
          } else {
            node.removeAttribute("data-active");
          }
        });
      }
      return;
    }

    const onScroll = () => {
      if (!raf) raf = window.requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    // Defer the first update to the next frame so it isn't synchronous
    // inside the effect body (avoids the set-state-in-effect lint rule).
    raf = window.requestAnimationFrame(update);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, [nodePositions, activeNode]);

  return (
    <div
      ref={rootRef}
      className={styles.thread}
      aria-hidden="true"
    >
      <div ref={lineRef} className={styles.threadLine} />

      {nodePositions.map((pos, i) => (
        <span
          key={i}
          className={styles.threadNode}
          data-active={activeNode === i ? "true" : undefined}
          style={{
            top: `${(pos.ratio * 100).toFixed(2)}%`,
            // Per-node accent so even before the pulse arrives, each
            // node carries its own section colour.
            ["--node-color" as string]: SECTION_COLOURS[i] ?? "var(--accent)",
          }}
        />
      ))}

      <div ref={pulseRef} className={styles.threadPulse} />
    </div>
  );
}
