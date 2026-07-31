"use client";

import { type CSSProperties } from "react";
import styles from "./WhoAmI.module.css";
import { useScrollReveal } from "./useScrollReveal";
import { useTypewriter } from "@/components/Hero/useTypewriter";
import { useReducedMotion } from "@/components/Hero/useReducedMotion";

/* =========================================================
 * WhoAmI — §۱ «کی هستم»  (Calcination)
 * accent: var(--accent)  — gold
 * ---------------------------------------------------------
 * First step of the journey: pure intro. A single gold dot,
 * a typewritten name, the meta line, and a short bio.
 * Scroll-reveal stagger across kicker → dot → name → meta → bio.
 * ========================================================= */

const NAME = "طاها حسینی هستم.";
const META = "۱۶ ساله · تهران · علوم انسانیِ فیلم‌شده";
const BIO =
  "شانزده سالمه و توی تهران بزرگ می‌شم. روزها توی مدرسه هگل و فوکو می‌خونم، شب‌ها پای لپ‌تاپ کد می‌زنم. خیلی وقت فکر می‌کردم این دو دنیا از هم جدان — تا فهمیدم هر دو یه کارُ می‌کنن: می‌پرسن «چیزی که هست، چرا هست؟». یکی با کلمه می‌پرسه، یکی با کد. من از این دو تا سوال یه چیزی می‌سازم.";

const delay = (ms: number): CSSProperties =>
  ({ "--reveal-delay": `${ms}ms` }) as CSSProperties;

export default function WhoAmI() {
  const { ref, revealed } = useScrollReveal<HTMLDivElement>({
    threshold: 0.15,
    rootMargin: "0px 0px -10% 0px",
    once: true,
  });
  const reducedMotion = useReducedMotion();
  const { typed } = useTypewriter(NAME, revealed, reducedMotion, 160);

  return (
    <section
      id="whoami"
      ref={ref}
      className={styles.whoAmI}
      data-journey-section="1"
      aria-labelledby="who-title"
    >
      <div className={styles.inner}>
        <span className={styles.kicker} style={delay(0)}>
          <span className={styles.kickerDot} aria-hidden="true" />
          §۱ · کی هستم
        </span>

        <div className={styles.portrait}>
          <span
            className={styles.portraitDot}
            aria-hidden="true"
            style={delay(80)}
          />
          <h2
            id="who-title"
            className={styles.name}
            style={delay(160)}
            aria-label={NAME}
          >
            <span className={styles.nameText}>{typed}</span>
            <span
              className={styles.cursor}
              aria-hidden="true"
              data-hidden={typed.length >= NAME.length ? "true" : "false"}
            />
          </h2>
          <p className={styles.meta} style={delay(600)}>
            {META}
          </p>
          <p className={styles.bio} style={delay(760)}>
            {BIO}
          </p>
        </div>

        <div className={styles.transitionStrip} aria-hidden="true">
          <span className={styles.stripText}>حالا که منو شناختی — بذار بگم چی می‌سازم</span>
          <span className={styles.stripArrow}>↓</span>
        </div>
      </div>
    </section>
  );
}
