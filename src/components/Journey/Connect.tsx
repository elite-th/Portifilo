"use client";

import { type CSSProperties, type ReactNode } from "react";
import styles from "./Connect.module.css";
import { useScrollReveal } from "./useScrollReveal";

/* =========================================================
 * Connect — §۵ «بیا وصل بشیم»  (Coagulation → Gold)
 * accent: gradient from --accent (gold) to --accent-2 (olive)
 * ---------------------------------------------------------
 * Final convergence point of the journey. Three contact
 * cards (email, github, twitter) stagger in, capped by a
 * large gradient CTA: «بیا وصل بشیم».
 * ========================================================= */

const delay = (ms: number): CSSProperties =>
  ({ "--reveal-delay": `${ms}ms` }) as CSSProperties;

interface ContactLink {
  href: string;
  label: string;
  value: string;
  external?: boolean;
  icon: ReactNode;
}

const CONTACTS: ContactLink[] = [
  {
    href: "mailto:hi@taha-hosseini.dev",
    label: "ایمیل",
    value: "hi@taha-hosseini.dev",
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M3 7l9 6 9-6" />
      </svg>
    ),
  },
  {
    href: "https://github.com/taha-hosseini",
    label: "گیت‌هاب",
    value: "@taha-hosseini",
    external: true,
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true">
        <path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.08 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02a9.56 9.56 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.69-4.57 4.94.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2z"/>
      </svg>
    ),
  },
  {
    href: "https://twitter.com/taha_hosseini",
    label: "توییتر",
    value: "@taha_hosseini",
    external: true,
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
  },
];

export default function Connect() {
  const { ref } = useScrollReveal<HTMLDivElement>({
    threshold: 0.12,
    rootMargin: "0px 0px -8% 0px",
    once: true,
  });

  return (
    <section
      id="connect"
      ref={ref}
      className={styles.connect}
      data-journey-section="5"
      aria-labelledby="connect-title"
    >
      {/* Coagulation glow — particles converging to center */}
      <div className={styles.coagulationGlow} aria-hidden="true" />

      <div className={styles.inner}>
        <h2 id="connect-title" className={styles.connectTitle} style={delay(0)}>
          <span className={styles.titleLine1}>حالا که تا اینجا آمدی —</span>
          <span className={styles.titleLine2}>بیا وصل بشیم.</span>
        </h2>

        <p className={styles.connectSub} style={delay(140)}>
          ایمیل بزن، issue باز کن، یه فکر بفرست. هر کانالی که راحتی.
          <br />
          من همیشه جواب می‌دم — شاید چند ساعت بعد، ولی جواب می‌دم.
          <br />
          اگر در ساخت چیزی هستی و گیر کردی، بیشتر از هر وقت دیگری مزاحمش نکن.
        </p>

        <div className={styles.connectGrid}>
          {CONTACTS.map((c, i) => (
            <a
              key={c.label}
              href={c.href}
              className={styles.connectCard}
              style={delay(260 + i * 100)}
              {...(c.external
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
            >
              <span className={styles.connectIcon} aria-hidden="true">
                {c.icon}
              </span>
              <span className={styles.connectLabel}>{c.label}</span>
              <span className={styles.connectValue}>{c.value}</span>
              <span className={styles.connectArrow} aria-hidden="true">↗</span>
            </a>
          ))}
        </div>

        <p className={styles.connectPostscript} style={delay(620)}>
          همون‌جا بالا گفتم: جایی که اندیشه، کالبد می‌یابد.
          <br />
          حالا نوبتِ توئه — بذار اندیشه‌ات کالبد بگیره.
        </p>
      </div>
    </section>
  );
}
