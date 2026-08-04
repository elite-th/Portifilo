/* =========================================================
 * questionsData — data for §۵ «چیزهایی که هنوز نمی‌دونم»
 * ---------------------------------------------------------
 * Named questionsData, not openQuestions, so it can't collide
 * with OpenQuestions.tsx on case-insensitive filesystems.
 *
 * Static on purpose. No API, no DB, no build step — adding a
 * question is a one-line edit here.
 *
 * Dates are hand-written Jalali strings. The project has no
 * Jalali conversion anywhere, and adding a date library to
 * render ~8 fixed strings would be the wrong trade.
 *
 * status:
 *   "open"      — asked, untouched
 *   "thinking"  — actively chewing on it
 *   "answered"  — resolved; `answer` becomes required in spirit
 *
 * Order: newest first. The list is meant to grow at the top.
 * ========================================================= */

export type QuestionStatus = "open" | "thinking" | "answered";

export interface OpenQuestion {
  /** Jalali date, hand-written — e.g. "۱۴۰۵/۰۵/۰۲" */
  date: string;
  status: QuestionStatus;
  /** The question itself. Keep it a real question, ending in "؟" */
  text: string;
  /** Where it came from — a project, a book, a class. Optional. */
  context?: string;
  /** Only meaningful when status is "answered". */
  answer?: string;
}

export const QUESTION_STATUS_LABELS: Record<QuestionStatus, string> = {
  open: "باز",
  thinking: "دارم روش فکر می‌کنم",
  answered: "یه جواب پیدا کردم",
};

export const QUESTIONS: OpenQuestion[] = [
  {
    date: "۱۴۰۵/۰۵/۰۲",
    status: "thinking",
    text:
      "چطور یه ساختار داده طراحی کنم که هم گراف باشه هم لیست، بدون اینکه هیچ‌کدوم رو بد اجرا کنه؟",
    context: "Taskino",
  },
  {
    date: "۱۴۰۵/۰۴/۲۵",
    status: "open",
    text:
      "اگه یه ابزار انقدر شخصی‌سازی بشه که فقط برای من کار کنه، دیگه ابزاره یا فقط یه عادت که کد شده؟",
    context: "Taskino",
  },
  {
    date: "۱۴۰۵/۰۴/۱۱",
    status: "open",
    text:
      "چرا وقتی چیزی رو یادداشت می‌کنم بهتر یادم می‌مونه، حتی اگه دیگه هیچ‌وقت اون یادداشت رو نخونم؟",
    context: "فلسفه‌ی ذهن",
  },
  {
    date: "۱۴۰۵/۰۳/۲۸",
    status: "thinking",
    text:
      "مرز بین «ساده کردن» و «ناقص کردن» کجاست؟ از کجا بفهمم دارم کدومش رو انجام می‌دم؟",
  },
  {
    date: "۱۴۰۵/۰۳/۱۱",
    status: "answered",
    text:
      "برای شروع یه پروژه باید اول معماریش رو کامل بچینم یا از کوچیک‌ترین چیزی که کار می‌کنه شروع کنم؟",
    answer:
      "از کوچیک‌ترین چیزی که کار می‌کنه. هر بار که اول معماری چیدم، معماری‌ای ساختم برای مسئله‌ای که هنوز نفهمیده بودمش.",
  },
  {
    date: "۱۴۰۵/۰۲/۱۹",
    status: "answered",
    text: "چرا هیچ اپلیکیشن یادداشت‌برداری‌ای شبیه ذهن من کار نمی‌کنه؟",
    answer:
      "چون همه‌شون فرض می‌کنن فکر خطیه. ذهن در شبکه کار می‌کنه، ولی رابط‌های کاربری در فهرست. مسئله ذخیره‌سازی نیست، شکل ارتباطه.",
  },
];
