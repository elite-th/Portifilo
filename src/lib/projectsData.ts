export interface ProjectRecord {
  project: string;
  slug: string;
  rootThought: string;
  builtStructure: string;
  tags: string[];
  summary: string;
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/--+/g, "-");
}

const raw: Omit<ProjectRecord, "slug">[] = [
  {
    project: "Taskino",
    rootThought: "تسک‌لیست‌های خطی جواب‌گوی مغزِ غیرخطی من نیستن.",
    builtStructure: "تسک‌ها روی یه گراف می‌شینن؛ اولویت از رابطه‌ها بیرون میاد.",
    tags: ["Offline-First", "Local-First", "Priority Network", "Semantic Graph"],
    summary: "مدیریت وظایف مبتنی بر گراف معنایی، نه لیست خطی — اولویت از رابطه‌ها می‌آید.",
  },
  {
    project: "Mind 2.0",
    rootThought: "هزار یادداشت، هیچی پیدا نمی‌شه.",
    builtStructure: "هر یادداشت با فاز/منبع/خروجی برچسب می‌خوره.",
    tags: ["Decision Architecture", "Entropy Reduction", "Cognitive Load", "Second Brain"],
    summary: "معماری تصمیم برای یادداشت‌ها — هر یادداشت فاز و مقصد دارد.",
  },
  {
    project: "Humanities × Code",
    rootThought: "علوم انسانی رو همه بی‌فایده می‌دونن.",
    builtStructure: "پروژه‌ای که کد رو به‌مثابه‌ی تفسیر می‌بینه.",
    tags: ["Hermeneutics", "Digital Humanities", "Critical Theory", "Code as Interpretation"],
    summary: "کد به مثابه هرمنوتیک مدرن — فلسفه به عنوان specification.",
  },
  {
    project: "Circadian Notes",
    rootThought: "۲:۱۴ صبح ایده‌ی ناب؛ ۷ صبح یادت رفته.",
    builtStructure: "ضبطِ ایده در لحظه‌ی ظهور، نه بعداً.",
    tags: ["Circadian Rhythm", "Capture at Dawn", "Fleeting Thoughts", "Biological Clock"],
    summary: "ثبت ایده در لحظه‌ی ظهور — هماهنگ با ریتم شبانه‌روزی.",
  },
  {
    project: "Offline-First Architecture",
    rootThought: "مترو صبح، اتصال قطع، ایده‌ها کجا می‌رن؟",
    builtStructure: "معماریِ آفلاین-اول؛ سینک بعد از وصل‌شدن.",
    tags: ["Offline-First", "Local-First", "Resilience", "CRDTs", "Sync Protocols"],
    summary: "تاب‌آوری واقعی — سیستم در انزوا هم حیات دارد، سینک پس از اتصال.",
  },
  {
    project: "Meta",
    rootThought: "Taskino فقط برای منه؟",
    builtStructure: "تبدیلِ ابزارِ شخصی به زیرساختِ عمومی.",
    tags: ["Meta-Tooling", "Composability", "Abstraction", "Framework for Frameworks"],
    summary: "ابزاری برای ساخت ابزار — تبدیل تجربه شخصی به زیرساخت.",
  },
];

export const PROJECTS: ProjectRecord[] = raw.map((r) => ({
  ...r,
  slug: slugify(r.project),
}));

export function getProjectBySlug(slug: string): ProjectRecord | undefined {
  return PROJECTS.find((p) => p.slug === slug);
}

export function getAllProjectSlugs(): string[] {
  return PROJECTS.map((p) => p.slug);
}
