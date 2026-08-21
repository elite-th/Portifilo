"use client";

import { useScrollReveal } from "@/components/Journey/useScrollReveal";
import styles from "./Projects.module.css";
import ProjectCard from "./ProjectCard";

interface ProjectData {
  rootThought: string;
  builtStructure: string;
  project: string;
  tags: string[];
  /** موقتاً غیرفعال — صفحه‌ی اختصاصی هر پروژه هنوز ساخته نشده. */
  href?: string;
}

const projects: ProjectData[] = [
  {
    rootThought:
      "تسک‌لیست‌های خطی جواب‌گوی مغزِ غیرخطی من نیستن.",
    builtStructure:
      "تسک‌ها روی یه گراف می‌شینن؛ اولویت از رابطه‌ها بیرون میاد.",
    project: "Taskino",
    tags: ["Offline-First", "Local-First", "Priority Network", "Semantic Graph"],
  },
  {
    rootThought:
      "هزار یادداشت، هیچی پیدا نمی‌شه.",
    builtStructure:
      "هر یادداشت با فاز/منبع/خروجی برچسب می‌خوره.",
    project: "Mind 2.0",
    tags: ["Decision Architecture", "Entropy Reduction", "Cognitive Load", "Second Brain"],
  },
  {
    rootThought:
      "علوم انسانی رو همه بی‌فایده می‌دونن.",
    builtStructure:
      "پروژه‌ای که کد رو به‌مثابه‌ی تفسیر می‌بینه.",
    project: "Humanities × Code",
    tags: ["Hermeneutics", "Digital Humanities", "Critical Theory", "Code as Interpretation"],
  },
  {
    rootThought:
      "۲:۱۴ صبح ایده‌ی ناب؛ ۷ صبح یادت رفته.",
    builtStructure:
      "ضبطِ ایده در لحظه‌ی ظهور، نه بعداً.",
    project: "Circadian Notes",
    tags: ["Circadian Rhythm", "Capture at Dawn", "Fleeting Thoughts", "Biological Clock"],
  },
  {
    rootThought:
      "مترو صبح، اتصال قطع، ایده‌ها کجا می‌رن؟",
    builtStructure:
      "معماریِ آفلاین-اول؛ سینک بعد از وصل‌شدن.",
    project: "Offline-First Architecture",
    tags: ["Offline-First", "Local-First", "Resilience", "CRDTs", "Sync Protocols"],
  },
  {
    rootThought:
      "Taskino فقط برای منه؟",
    builtStructure:
      "تبدیلِ ابزارِ شخصی به زیرساختِ عمومی.",
    project: "Meta",
    tags: ["Meta-Tooling", "Composability", "Abstraction", "Framework for Frameworks"],
  },
];

export default function Projects() {
  const { ref, revealed } = useScrollReveal<HTMLElement>({
    threshold: 0.1,
    rootMargin: "0px 0px -10% 0px",
  });

  // اعداد از خودِ داده می‌آیند تا با اضافه‌شدنِ پروژه از هم نپاشند
  const fa = (n: number) => n.toLocaleString("fa-IR", { minimumIntegerDigits: 2 });
  const tagCount = projects.reduce((sum, p) => sum + p.tags.length, 0);

  return (
    <section
      ref={ref}
      id="projects"
      className={styles.projects}
      aria-labelledby="projects-title"
      data-revealed={revealed ? "true" : undefined}
    >
      {/* میزِ آزمایشگاه — کاغذِ شطرنجی + نورِ سقفی */}
      <div className={styles.bench} aria-hidden="true">
        <div className={styles.grid1} />
        <div className={styles.bgGlow} />
      </div>

      <div className={styles.inner}>
        <div className={styles.threadBridge} aria-hidden="true" />

        <header className={styles.header}>
          <span className={styles.kicker} data-reveal>
            <span className={styles.kickerDot} aria-hidden="true" />
            آزمایشگاه
          </span>
          <h2 id="projects-title" className={styles.title} data-reveal>
            چیزهایی که از این ذهن بیرون آمده.
          </h2>
          <p className={styles.desc} data-reveal>
            این پروژه‌ها ویترین جدا از من نیستند؛ هرکدام ردِ یکی از دغدغه‌هایم‌اند.
          </p>

          {/* نوارِ وضعیتِ آزمایشگاه */}
          <div className={styles.status} data-reveal>
            <span className={styles.statusItem}>
              <span className={styles.statusValue}>{fa(projects.length)}</span>
              <span className={styles.statusKey}>نمونه</span>
            </span>
            <span className={styles.statusDivider} aria-hidden="true" />
            <span className={styles.statusItem}>
              <span className={styles.statusValue}>{fa(tagCount)}</span>
              <span className={styles.statusKey}>شاخص</span>
            </span>
            <span className={styles.statusDivider} aria-hidden="true" />
            <span className={styles.statusItem} data-live>
              <span className={styles.statusPulse} aria-hidden="true" />
              <span className={styles.statusKey}>در جریان</span>
            </span>
          </div>
        </header>

        <div className={styles.grid}>
          {projects.map((project, i) => (
            <ProjectCard
              key={project.project}
              {...project}
              index={i}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
