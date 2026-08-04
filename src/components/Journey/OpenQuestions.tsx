"use client";

import { type CSSProperties } from "react";
import styles from "./OpenQuestions.module.css";
import { useScrollReveal } from "./useScrollReveal";
import {
  QUESTIONS,
  QUESTION_STATUS_LABELS,
  type OpenQuestion,
} from "./questionsData";

/* =========================================================
 * OpenQuestions — §۵ «چیزهایی که هنوز نمی‌دونم»  (Fermentation)
 * accent: var(--highlight) — ochre / gold
 * ---------------------------------------------------------
 * The evidence section: sits between the two claim sections
 * (WhatIBuild, WhereIGo) and the CTA. Instead of asserting
 * competence it shows dated open questions — the one artifact
 * on this page that can't be faked or copied.
 *
 * Deliberately different from every sibling section:
 *   - ochre, where the others are verdigris
 *   - single-column list, where the others are card grids
 *   - horizontal rules only, no card borders
 *   - reads like a notebook, not a portfolio
 *
 * Answered questions are struck through with a short answer
 * beneath — proof that questions here actually die.
 * ========================================================= */

const delay = (ms: number): CSSProperties =>
  ({ "--reveal-delay": `${ms}ms` }) as CSSProperties;

function QuestionItem({ q, index }: { q: OpenQuestion; index: number }) {
  return (
    <li
      className={styles.item}
      data-status={q.status}
      style={delay(240 + index * 80)}
    >
      <div className={styles.itemHead}>
        <span className={styles.marker} aria-hidden="true">
          <span className={styles.markerCore} />
        </span>
        <time className={styles.date} dateTime={q.date}>
          {q.date}
        </time>
        <span className={styles.status}>
          {QUESTION_STATUS_LABELS[q.status]}
        </span>
      </div>

      <p className={styles.question}>{q.text}</p>

      {q.context ? (
        <p className={styles.context}>
          <span aria-hidden="true">»</span> {q.context}
        </p>
      ) : null}

      {q.status === "answered" && q.answer ? (
        <p className={styles.answer}>
          <span className={styles.answerArrow} aria-hidden="true">
            ↳
          </span>
          {q.answer}
        </p>
      ) : null}
    </li>
  );
}

export default function OpenQuestions() {
  const { ref } = useScrollReveal<HTMLDivElement>({
    threshold: 0.1,
    rootMargin: "0px 0px -8% 0px",
    once: true,
  });

  const openCount = QUESTIONS.filter((q) => q.status !== "answered").length;

  return (
    <section
      id="openquestions"
      ref={ref}
      className={styles.openQuestions}
      data-journey-section="5"
      aria-labelledby="questions-title"
    >
      <div className={styles.inner}>
        <header className={styles.sectionHeader}>
          <span className={styles.kicker} style={delay(0)}>
            <span className={styles.kickerDot} aria-hidden="true" />
            چیزهایی که هنوز نمی‌دونم
          </span>
          <h2
            id="questions-title"
            className={styles.title}
            style={delay(120)}
          >
            دفترِ سوال‌های باز
          </h2>
          <p className={styles.lead} style={delay(180)}>
            این سوال‌ها هنوز جواب ندارن. تاریخ‌شون هست تا معلوم باشه چقدر
            باهاشون سر و کله زدم.
          </p>
        </header>

        <ol className={styles.list}>
          {QUESTIONS.map((q, i) => (
            <QuestionItem key={q.date + q.text.slice(0, 12)} q={q} index={i} />
          ))}
        </ol>

        <p className={styles.footnote} style={delay(240 + QUESTIONS.length * 80)}>
          الان {toPersianDigits(openCount)} سوال بی‌جواب روی میزه. لیست
          کوتاه‌تر نمی‌شه — هر جوابی که پیدا می‌کنم، دو تا سوال جدید می‌آره.
        </p>
      </div>
    </section>
  );
}

/** ۱۲ → «۱۲». Intl would pull a full locale for a 2-digit count. */
function toPersianDigits(n: number): string {
  return String(n).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);
}
