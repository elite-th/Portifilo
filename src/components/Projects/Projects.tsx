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
      "لیست‌های خطی جواب نمی‌دهند. ذهن انسان در ماتریس‌ها زیست می‌کند، نه در صف‌های بی‌پایان.",
    builtStructure:
      "Taskino: شبکه‌ی معناییِ اولویت‌ها. معماری مبتنی بر گراف جهت مدل‌سازی وابستگی‌ها، انرژی، و بازده.",
    project: "Taskino",
    tags: ["Offline-First", "Local-First", "Priority Network", "Semantic Graph"],
    href: "/projects/taskino",
  },
  {
    rootThought:
      "ترس از انتخابِ بی‌نهایت. حیرتِ مواجهه با بیشمار مسیر، مانعِ اقدام است.",
    builtStructure:
      "Mind 2.0: مدیریتِ وظایف مبتنی بر اولویت. الگوریتم‌های تصمیم‌گیری که إنتروپی را به نظم تبدیل می‌کنند.",
    project: "Mind 2.0",
    tags: ["Decision Architecture", "Entropy Reduction", "Cognitive Load", "Second Brain"],
    href: "/projects/mind2",
  },
  {
    rootThought:
      "علوم انسانی «سخت» نیست. فلسفه، تاریخ، و ادبیات، داده‌ی خامِ نوآوری هستند.",
    builtStructure:
      "Humanities × Code: هرمنوتیکِ مدرن — کد به‌مثابه‌ی تفسیر. مهندسیِ نرم‌افزار به‌عنوان رشته‌ای از علوم انسانیِ کاربردی.",
    project: "Humanities × Code",
    tags: ["Hermeneutics", "Digital Humanities", "Critical Theory", "Code as Interpretation"],
    href: "/projects/humanities-code",
  },
  {
    rootThought:
      "ایده‌های شبانه می‌میرند. لحظه‌ی بیداری، لحظه‌ی فوتِ خلاقیتِ ناب است.",
    builtStructure:
      "Circadian Notes: ساعتِ زیستی — ثبت در لحظه‌ی ظهور. ابزارِ ضبطِ ایده که با ریتمِ سرکاردیئن هم‌ریخت است.",
    project: "Circadian Notes",
    tags: ["Circadian Rhythm", "Capture at Dawn", "Fleeting Thoughts", "Biological Clock"],
    href: "/projects/circadian",
  },
  {
    rootThought:
      "اینترنت همیشه نیست. متروی صبح، اتصالِ قطع، ایده‌ها کجا می‌روند؟",
    builtStructure:
      "Offline-First Architecture: تاب‌آوریِ واقعی. سیستم‌هایی که در انزوا نیز حیات دارند، با واقعیتِ زیسته هم‌ریخت.",
    project: "Offline-First Architecture",
    tags: ["Offline-First", "Local-First", "Resilience", "CRDTs", "Sync Protocols"],
    href: "/projects/offline-first",
  },
  {
    rootThought:
      "Taskino فقط برای من است؟ ابزاری برای ساختِ ابزار، ابرابزارِ فکر است.",
    builtStructure:
      "Meta: فریم‌ورکِ ساختِ فریم‌ورک. انتزاعِ الگو تا ابدیتِ کاربردِ مجدد — ابزارِ ساختنِ ابزار.",
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
            تبلورِ مفاهیم در کالبدِ تکنولوژی.
          </h2>
          <p className={styles.desc} data-reveal>
            هر پروژه، یک کریستال است — پاسخِ تبلور‌یافته‌ی یک فکرِ خام.
            روی هر کریستال برو تا ببینی چطور از پراکندگی به ساختار رسید.
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
          هر کریستال، یک بار پراکنده بوده — آن‌جا که ایده خام بود.
        </p>
      </div>
    </section>
  );
}
