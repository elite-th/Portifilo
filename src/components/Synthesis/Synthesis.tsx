"use client";

import { useEffect, useRef, type ReactNode, type RefObject } from "react";
import { useScrollReveal } from "@/components/Journey/useScrollReveal";
import styles from "./Synthesis.module.css";

/* ============================================================
 * useCrucibleCanvas — ذرات شناورِ کیمیاگری
 * ------------------------------------------------------------
 * یک canvas سبک با ذراتِ طلایی که آرام به بالا می‌روند و
 * wrap می‌شوند. در حالت reduced-motion، ذرات ساکن می‌مانند.
 * ============================================================ */
function useCrucibleCanvas(canvasRef: RefObject<HTMLCanvasElement | null>) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    const count = isMobile ? 18 : 36;

    const particles = Array.from({ length: count }, () => ({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * 0.0004,
      vy: -Math.random() * 0.0006 - 0.0001,
      r: Math.random() * 1.4 + 0.4,
      alpha: Math.random() * 0.4 + 0.15,
      twinkle: Math.random() * Math.PI * 2,
    }));

    let raf = 0;
    let last = performance.now();

    const render = (now: number) => {
      const dt = Math.min(now - last, 48);
      last = now;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);

      for (const p of particles) {
        if (!reduced) {
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.twinkle += 0.02;
          if (p.x < -0.02) p.x = 1.02;
          if (p.x > 1.02) p.x = -0.02;
          if (p.y < -0.05) p.y = 1.05;
        }
        const px = p.x * w;
        const py = p.y * h;
        const twinkleAlpha = reduced
          ? p.alpha
          : p.alpha * (0.7 + 0.3 * Math.sin(p.twinkle));
        ctx.fillStyle = `rgba(212, 175, 106, ${twinkleAlpha.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(px, py, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(raf);
    };
  }, [canvasRef]);
}

interface Pillar {
  label: string;
  title: string;
  desc: string;
  icon: ReactNode;
}

export default function Synthesis() {
  const { ref, revealed } = useScrollReveal<HTMLElement>({
    threshold: 0.12,
    rootMargin: "0px 0px -12% 0px",
  });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useCrucibleCanvas(canvasRef);

  const pillars: Pillar[] = [
    {
      label: "چرا؟",
      title: "Humanities as OS",
      desc: "قبل از اینکه چیزی بسازی، باید بدانی چرا. فلسفه specification می‌دهد، کد پیاده می‌کند. علوم انسانی، سیستم‌عاملِ ذهنِ منه.",
      icon: (
        <svg
          viewBox="0 0 48 48"
          width="32"
          height="32"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden="true"
        >
          <polygon points="24,4 42,14 42,34 24,44 6,34 6,14" />
          <line x1="24" y1="4" x2="24" y2="44" />
          <line x1="6" y1="14" x2="42" y2="34" />
          <line x1="42" y1="14" x2="6" y2="34" />
        </svg>
      ),
    },
    {
      label: "چگونه؟",
      title: "Code as Hermeneutics",
      desc: "هر تابع یک قرائت است. هر API یک قاعده‌ی هرمنوتیک. کد، تفسیرِ دنیاست — فقط به زبونِ صفر و یک.",
      icon: (
        <svg
          viewBox="0 0 48 48"
          width="32"
          height="32"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden="true"
        >
          <polygon points="24,6 42,24 24,42 6,24" />
          <polygon points="24,14 34,24 24,34 14,24" />
          <line x1="24" y1="6" x2="24" y2="14" />
          <line x1="42" y1="24" x2="34" y2="24" />
          <line x1="24" y1="42" x2="24" y2="34" />
          <line x1="6" y1="24" x2="14" y2="24" />
        </svg>
      ),
    },
    {
      label: "چیست؟",
      title: "Structure as Freedom",
      desc: "typeها، schemaها، offline-first — همه محدودیت‌اند. ولی تازه همین محدودیت‌ها جاییه که خلاقیت می‌تونه نفس بکشه. آزادی بدون ساختار، فقط اضطرابه.",
      icon: (
        <svg
          viewBox="0 0 48 48"
          width="32"
          height="32"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden="true"
        >
          <polygon points="24,4 44,24 24,44 4,24" />
          <line x1="24" y1="4" x2="24" y2="44" strokeDasharray="2 3" />
          <line x1="4" y1="24" x2="44" y2="24" strokeDasharray="2 3" />
          <circle cx="24" cy="24" r="4" fill="currentColor" stroke="none" />
        </svg>
      ),
    },
  ];

  return (
    <section
      ref={ref}
      id="synthesis"
      className={styles.synthesis}
      aria-labelledby="synthesis-title"
      data-revealed={revealed ? "true" : undefined}
    >
      {/* Crucible پس‌زمینه */}
      <div className={styles.crucibleBg} aria-hidden="true">
        <div className={styles.crucibleGlow} />
        <canvas ref={canvasRef} className={styles.crucibleCanvas} aria-hidden="true" />
        <div className={styles.crucibleRing} />
      </div>

      <div className={styles.container}>
        <header className={styles.header}>
          <span className={styles.kicker} data-reveal>
            <span className={styles.kickerDot} aria-hidden="true" />
            §تبلور
          </span>
          <h2 id="synthesis-title" className={styles.title} data-reveal>
            از پرسش تا ساخت — منطقِ کارِ من.
          </h2>
          <p className={styles.subtitle} data-reveal>
            هر چیزی که می‌سازم، خروجیِ یک معادله‌ست.
            <br />
            دو ضرفِ انسانی، یکی الگوریتمی. حاصل: چیزی که نه کاملاً فلسفه است،
            <br />
            نه کاملاً کد — چیزی شبیه طلا.
          </p>
        </header>

        {/* معادله‌ی بصری زنده */}
        <div
          className={styles.equation}
          role="math"
          aria-label="مسئله‌ی انسانی به‌علاوه‌ی راهکار الگوریتمی مساویِ ابزارِ معنادار"
        >
          <div className={styles.term} data-reveal>
            <span className={styles.termBox}>
              <span className={styles.termIcon} aria-hidden="true">❓</span>
              <span className={styles.termLabel}>مسئله‌ی انسانی</span>
            </span>
            <span className={styles.termSub}>«چرا؟»</span>
          </div>

          <span className={styles.operator} data-reveal aria-hidden="true">
            +
          </span>

          <div className={styles.term} data-reveal>
            <span className={styles.termBox}>
              <span className={styles.termIcon} aria-hidden="true">⚙</span>
              <span className={styles.termLabel}>راهکارِ الگوریتمی</span>
            </span>
            <span className={styles.termSub}>«چگونه؟»</span>
          </div>

          <span className={styles.operator} data-reveal aria-hidden="true">
            =
          </span>

          <div className={`${styles.term} ${styles.termResult}`} data-reveal>
            <span className={styles.termBox}>
              <span className={styles.termIcon} aria-hidden="true">✦</span>
              <span className={styles.termLabel}>ابزارِ معنادار</span>
            </span>
            <span className={styles.termSub}>«چیست؟»</span>
          </div>
        </div>

        {/* خط نوری که ۳ ستون را وصل می‌کند */}
        <div className={styles.lightLine} aria-hidden="true">
          <svg
            viewBox="0 0 1200 80"
            preserveAspectRatio="none"
            className={styles.lightLineSvg}
          >
            <defs>
              <linearGradient id="synthesis-trace-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="var(--accent)" stopOpacity="0" />
                <stop offset="50%" stopColor="var(--accent-bright)" stopOpacity="0.85" />
                <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d="M120,52 Q600,4 1080,52"
              fill="none"
              stroke="url(#synthesis-trace-grad)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeDasharray="4 6"
              className={styles.lightLinePath}
            />
            <circle className={styles.lightLineDot} cx="120" cy="52" r="2.5" />
            <circle className={styles.lightLineDot} cx="600" cy="10" r="2.5" />
            <circle className={styles.lightLineDot} cx="1080" cy="52" r="2.5" />
          </svg>
        </div>

        {/* ۳ ستون */}
        <div className={styles.pillars}>
          {pillars.map((pillar, i) => (
            <article
              key={pillar.title}
              className={styles.pillarCard}
              data-reveal
            >
              <span className={styles.pillarIcon} aria-hidden="true">
                {pillar.icon}
              </span>
              <span className={styles.pillarLabel}>{pillar.label}</span>
              <h3 className={styles.pillarTitle}>{pillar.title}</h3>
              <p className={styles.pillarDesc}>{pillar.desc}</p>
              <span className={styles.pillarIndex} aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
