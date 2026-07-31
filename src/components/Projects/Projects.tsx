"use client";

import { useScrollReveal } from "@/components/Journey/useScrollReveal";
import styles from "./Projects.module.css";
import ProjectCard from "./ProjectCard";

interface ProjectData {
  rootThought: string;
  builtStructure: string;
  project: string;
  tags: string[];
  href: string;
}

const projects: ProjectData[] = [
  {
    rootThought:
      "تسک‌لیست‌های خطی جواب‌گوی مغزِ غیرخطی من نیستن.",
    builtStructure:
      "تسک‌ها روی یه گراف می‌شینن؛ اولویت از رابطه‌ها بیرون میاد.",
    project: "Taskino",
    tags: ["Offline-First", "Local-First", "Priority Network", "Semantic Graph"],
    href: "/projects/taskino",
  },
  {
    rootThought:
      "هزار یادداشت، هیچی پیدا نمی‌شه.",
    builtStructure:
      "هر یادداشت با فاز/منبع/خروجی برچسب می‌خوره.",
    project: "Mind 2.0",
    tags: ["Decision Architecture", "Entropy Reduction", "Cognitive Load", "Second Brain"],
    href: "/projects/mind2",
  },
  {
    rootThought:
      "علوم انسانی رو همه بی‌فایده می‌دونن.",
    builtStructure:
      "پروژه‌ای که کد رو به‌مثابه‌ی تفسیر می‌بینه.",
    project: "Humanities × Code",
    tags: ["Hermeneutics", "Digital Humanities", "Critical Theory", "Code as Interpretation"],
    href: "/projects/humanities-code",
  },
  {
    rootThought:
      "۲:۱۴ صبح ایده‌ی ناب؛ ۷ صبح یادت رفته.",
    builtStructure:
      "ضبطِ ایده در لحظه‌ی ظهور، نه بعداً.",
    project: "Circadian Notes",
    tags: ["Circadian Rhythm", "Capture at Dawn", "Fleeting Thoughts", "Biological Clock"],
    href: "/projects/circadian",
  },
  {
    rootThought:
      "مترو صبح، اتصال قطع، ایده‌ها کجا می‌رن؟",
    builtStructure:
      "معماریِ آفلاین-اول؛ سینک بعد از وصل‌شدن.",
    project: "Offline-First Architecture",
    tags: ["Offline-First", "Local-First", "Resilience", "CRDTs", "Sync Protocols"],
    href: "/projects/offline-first",
  },
  {
    rootThought:
      "Taskino فقط برای منه؟",
    builtStructure:
      "تبدیلِ ابزارِ شخصی به زیرساختِ عمومی.",
    project: "Meta",
    tags: ["Meta-Tooling", "Composability", "Abstraction", "Framework for Frameworks"],
    href: "/projects/meta",
  },
];

export default function Projects() {
  const { ref, revealed } = useScrollReveal<HTMLElement>({
    threshold: 0.1,
    rootMargin: "0px 0px -10% 0px",
  });

  return (
    <section
      ref={ref}
      id="projects"
      className={styles.projects}
      aria-labelledby="projects-title"
      data-revealed={revealed ? "true" : undefined}
    >
      <div className={styles.bgGlow} aria-hidden="true" />

      <div className={styles.inner}>
        <header className={styles.header}>
          <span className={styles.kicker} data-reveal>
            <span className={styles.kickerDot} aria-hidden="true" />
            §آزمایشگاه
          </span>
          <h2 id="projects-title" className={styles.title} data-reveal>
            شش فکر خام. شش تا ساختار.
          </h2>
          <p className={styles.desc} data-reveal>
            هر پروژه یک کریستاله — از یک فکرِ خام شروع شده، به یک ساختار رسیده.
            <br />
            برو روی هر کدوم تا ببینی این تبدیل چطور اتفاق افتاده.
          </p>
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

        <p className={styles.footerNote} data-reveal>
          <span className={styles.footerDot} aria-hidden="true">✦</span>
          هیچ کریستالی بدون پراکندگی شکل نگرفته.
        </p>
      </div>
    </section>
  );
}
