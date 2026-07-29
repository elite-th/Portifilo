"use client";

import styles from "./Projects.module.css";
import ProjectCard from "./ProjectCard";

const projects = [
  {
    rootThought: "لیست‌های خطی جواب نمی‌دهند. ذهن انسان در ماتریس‌ها زیست می‌کند، نه در صف‌های بی‌پایان.",
    builtStructure: "Taskino: شبکه معنایی اولویت‌ها. معماری مبتنی بر گراف جهت مدل‌سازی وابستگی‌ها، انرژی، و بازده.",
    project: "Taskino",
    tags: ["Offline-First", "Local-First", "Priority Network", "Semantic Graph"],
    href: "/projects/taskino",
  },
  {
    rootThought: "ترس از انتخابِ بی‌نهایت. حیرتِ مواجهه با بیشمار مسیر، مانع اقدام است.",
    builtStructure: "مدیریت وظایف مبتنی بر اولویت. الگوریتم‌های تصمیم‌گیری که إنتروپی را به نظم تبدیل می‌کنند.",
    project: "Mind 2.0",
    tags: ["Decision Architecture", "Entropy Reduction", "Cognitive Load", "Second Brain"],
    href: "/projects/mind2",
  },
  {
    rootThought: "علوم انسانی «سخت» نیست. فلسفه، تاریخ، و ادبیات، داده‌ی خامِ نوآوری هستند.",
    builtStructure: "هرموتیک مدرن: کد به عنوان تفسیر. مهندسی نرم‌افزار به‌عنوان رشته‌ای از علوم انسانیِ کاربردی.",
    project: "Humanities × Code",
    tags: ["Hermeneutics", "Code as Interpretation", "Digital Humanities", "Critical Theory"],
    href: "/projects/humanities-code",
  },
  {
    rootThought: "ایده‌های شبانه می‌میرند. لحظه‌ی بیداری، لحظه‌ی فوتِ خلاقیتِ ناب است.",
    builtStructure: "ساعت زیستی: ثبت در لحظه‌ی ظهور. ابزار ضبط ایده که با ریتم سرکاردیєн هم‌ریخت است.",
    project: "Circadian Notes",
    tags: ["Circadian Rhythm", "Capture at Dawn", "Fleeting Thoughts", "Biological Clock"],
    href: "/projects/circadian",
  },
  {
    rootThought: "اینترنت همیشه نیست. مترو صبح، اتصال قطع، ایده‌ها کجا می‌روند؟",
    builtStructure: "معماری آفلاین‌اول: تاب‌آوری واقعی. سیستم‌هایی که در انزوا نیز حیات دارند، با واقعیت زیسته هم‌ریخت.",
    project: "Offline-First Architecture",
    tags: ["Offline-First", "Local-First", "Resilience", "Sync Protocols", "CRDTs"],
    href: "/projects/offline-first",
  },
  {
    rootThought: "Taskino فقط برای من است؟ ابزاری برای ساخت ابزار، ابرابزارِ فكر است.",
    builtStructure: "Meta: فریم‌ورکِ ساختِ فریم‌ورک. انتزاعِ الگو تا ابدیتِ کاربردِ مجدد.",
    project: "Meta",
    tags: ["Meta-Tooling", "Framework for Frameworks", "Abstraction", "Composability"],
    href: "/projects/meta",
  },
];

export default function Projects() {
  return (
    <section id="projects" className={styles.projects} aria-labelledby="projects-title">
      <div className={styles.inner}>
        <header className={styles.header}>
          <p className={styles.kicker}>آزمایشگاه</p>
          <h2 id="projects-title" className={styles.title}>
            تبلور مفاهیم در کالبد تکنولوژی.
          </h2>
          <p className={styles.desc}>
            این فضا، نقطه‌ی تلاقی یادداشت‌های فنی و تأملات فلسفی است. هر پروژه، پاسخِ تبلور
            شده‌ای به یک پرسشِ خام است.
          </p>
        </header>

        <div className={styles.grid} role="list">
          {projects.map((project, i) => (
            <ProjectCard key={project.project} {...project} />
          ))}
        </div>
      </div>
    </section>
  );
}