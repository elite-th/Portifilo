"use client";

import { type CSSProperties } from "react";
import styles from "./WhoAmI.module.css";
import { useScrollReveal } from "./useScrollReveal";
import { useTypewriter } from "@/components/Hero/useTypewriter";
import { useReducedMotion } from "@/components/Hero/useReducedMotion";

const NAME = "طاها حسینی هستم.";
const META = "۱۶ ساله · تهران";
const BIO =
  "شانزده سالمه و تهران بزرگ‌ترین کلاس منه. روزها با فلسفه و ادبیات سر و کله می‌زنم، شب‌ها همان سؤال‌ها را با کد امتحان می‌کنم. بیشتر از اینکه دنبال رزومه ساختن باشم، دارم ردِ ذهنم را ثبت می‌کنم.";

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
      data-alchemy-stage="01 — Calcination"
      aria-labelledby="who-title"
    >
      <div className={styles.inner}>
        <span className={styles.kicker} style={delay(0)}>
          <span className={styles.kickerDot} aria-hidden="true" />
          کی هستم
        </span>

        <div className={styles.portrait}>
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

        </div>
    </section>
  );
}
