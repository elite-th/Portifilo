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
      "تقویم و to-do list برای مغزی ساخته شده‌اند که خطی فکر می‌کند. مغز من خطی نیست.",
    builtStructure:
      "Taskino: تسک‌ها به‌جای صف، در یک گراف می‌نشینن. اولویت از شبکه بیرون میاد — از انرژی، وابستگی، و بازدهِ هر گره.",
    project: "Taskino",
    tags: ["Offline-First", "Local-First", "Priority Network", "Semantic Graph"],
    href: "/projects/taskino",
  },
  {
    rootThought:
      "هزار یادداشت. هیچی پیدا نمی‌شه. انتخاب از تصمیم سخت‌تره.",
    builtStructure:
      "Mind 2.0: یادداشت‌ها با خاستگاه و غایت وصل می‌شن. entropy شناختی پایین میاد، تصمیم برمی‌گرده.",
    project: "Mind 2.0",
    tags: ["Decision Architecture", "Entropy Reduction", "Cognitive Load", "Second Brain"],
    href: "/projects/mind2",
  },
  {
    rootThought:
      "همه میگن علوم انسانی بی‌فایده‌ست. هیچ‌کس نمی‌پرسه: کد بدون فلسفه، کدوم طرفِ بی‌فایده‌ست؟",
    builtStructure:
      "Humanities × Code: کد به‌مثابه‌ی هرمنوتیک. مهندسیِ نرم‌افزار، رشته‌ی انسانیِ کاربردی — نه برعکس.",
    project: "Humanities × Code",
    tags: ["Hermeneutics", "Digital Humanities", "Critical Theory", "Code as Interpretation"],
    href: "/projects/humanities-code",
  },
  {
    rootThought:
      "ساعت ۲:۱۴ صبح، ایده‌ی ناب. ساعت ۷ صبح، یادت رفته. مشکل کجاست؟",
    builtStructure:
      "Circadian Notes: ضبطِ ایده در لحظه‌ی ظهور — نه صبح، نه بعداً. هم‌ریخت با ریتمِ سرکاردیئن.",
    project: "Circadian Notes",
    tags: ["Circadian Rhythm", "Capture at Dawn", "Fleeting Thoughts", "Biological Clock"],
    href: "/projects/circadian",
  },
  {
    rootThought:
      "متروی صبح، اینترنت قطع. ایده‌ها کجان؟ سیستم از بین می‌ره یا منتظر می‌مونه؟",
    builtStructure:
      "Offline-First: سیستم در انزوا هم زنده‌ست. وقتی وصل شد، همگام می‌شه. با واقعیتِ زیسته‌ی تهران هم‌ریخت.",
    project: "Offline-First Architecture",
    tags: ["Offline-First", "Local-First", "Resilience", "CRDTs", "Sync Protocols"],
    href: "/projects/offline-first",
  },
  {
    rootThought:
      "۱۶ ساله‌ام، چرا اصلا پورتفولیو ساختم؟ نه برای نمایش — برای رصدِ تطورِ فکریِ خودم.",
    builtStructure:
      "Meta: ابزارِ ساختنِ ابزار. فریم‌ورکِ فریم‌ورک‌ها. انتزاع تا جایی که دیگران هم بتونن بسازن.",
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
            شش فکر خام. شش کریستال.
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
