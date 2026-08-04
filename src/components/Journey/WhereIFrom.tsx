"use client";

import { type CSSProperties } from "react";
import styles from "./WhereIFrom.module.css";
import { useScrollReveal } from "./useScrollReveal";

const delay = (ms: number): CSSProperties =>
  ({ "--reveal-delay": `${ms}ms` }) as CSSProperties;

export default function WhereIFrom() {
  const { ref } = useScrollReveal<HTMLDivElement>({
    threshold: 0.15,
    rootMargin: "0px 0px -10% 0px",
    once: true,
  });

  return (
    <section
      id="whereifrom"
      ref={ref}
      className={styles.whereIFrom}
      data-journey-section="3"
      aria-labelledby="from-title"
    >
      {/* بک‌گراند طلایی ایران */}
      <div className={styles.mapBg} aria-hidden="true">
        <img
          src="/gold-iran.svg"
          alt=""
          className={styles.mapImg}
          loading="lazy"
        />
      </div>

      <div className={styles.inner}>
        <span className={styles.kicker} style={delay(0)}>
          <span className={styles.kickerDot} aria-hidden="true" />
          از کجا میام
        </span>

        <h2 id="from-title" className={styles.title} style={delay(120)}>
          تهران، شب‌های بی‌خواب.
        </h2>

        <div className={styles.textBlock}>
          <p className={styles.para} style={delay(240)}>
            ساعت ۲:۱۴ صبح. لپ‌تاپ روی تخت روشنه، چراغ مطالعه روی میز، شهر بیرون
            پنجره هنوز بیداره.
          </p>
          <p className={styles.para} style={delay(360)}>
            اینجا جایی‌ست که ایده‌ها یا تا صبح فراموش می‌شن، یا کد می‌شن. واسه
            همین کارهام رو جوری می‌سازم که توی مترو هم بشه ادامه‌شون داد.
          </p>
        </div>
      </div>
    </section>
  );
}