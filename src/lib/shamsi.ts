// src/lib/shamsi.ts
// ───────────────────────────────────────────────────────────────────────────
// تاریخ شمسی (Jalali) — کاملاً self-contained، بدون dependency خارجی.
// الگوریتم: Borkowski / jalaali-js (تبدیل Gregorian ↔ Jalali با Julian Day Number).
// Pure functions، no Prisma import، client-safe (Worker B مستقیماً import می‌کند).
//
// Public API (طبق قرارداد Task 25-A):
//   toShamsi(date): string       → "۱۴۰۲/۰۵/۱۸"  (کوتاه، با اعداد فارسی)
//   toShamsiLong(date): string   → "۱۸ مرداد ۱۴۰۲" (بلند، با اعداد فارسی)
//   toRelative(date): string     → "۳ روز پیش" / "هفته‌ی گذشته" / "الان"
//   toPersianDigits(s): string   → تبدیل اعداد انگلیسی به فارسی
//
// Internal helpers (همچنین export شده برای entries.server.ts):
//   toShamsiParts(date): ShamsiDate  → {y, m, d} شیء خام
//   shamsiMonthName(m): string       → "فروردین".."اسفند"
//   currentShamsiMonthLabel(): string → "مرداد ۱۴۰۳"
//   isCurrentShamsiMonth(date): boolean
//
// تاریخ‌های مرجع (§۱۰.۱ نقشه راه):
//   2024-09-04 → 1403-06-14
//   2024-03-20 → 1403-01-01  (نوروز)
//   2024-01-01 → 1402-10-11
//   2025-03-21 → 1404-01-01
// ───────────────────────────────────────────────────────────────────────────

export interface ShamsiDate {
  y: number;
  m: number;
  d: number;
}

// ─── primitive helpers ──────────────────────────────────────────────────────
// هر دو تابع با truncation به سمت صفر کار می‌کنند (هماهنگ با jalaali-js).
// نکته: Math.floor برای اعداد منفی نتیجه‌ی متفاوتی می‌دهد و الگوریتم را خراب می‌کند.
function div(a: number, b: number): number {
  return ~~(a / b);
}

function mod(a: number, b: number): number {
  return a - ~~(a / b) * b;
}

// ─── Gregorian ↔ Julian Day Number ──────────────────────────────────────────
function g2d(gy: number, gm: number, gd: number): number {
  let d =
    div((gy + div(gm - 8, 6) + 100100) * 1461, 4) +
    div(153 * mod(gm + 9, 12) + 2, 5) +
    gd -
    34840408;
  d = d - div(div(gy + 100100 + div(gm - 8, 6), 100) * 3, 4) + 752;
  return d;
}

function d2g(jdn: number): { gy: number; gm: number; gd: number } {
  let j = 4 * jdn + 139361631;
  j = j + div(div(4 * jdn + 183187720, 146097) * 3, 4) * 4 - 3908;
  const i = div(mod(j, 1461), 4) * 5 + 308;
  const gd = div(mod(i, 153), 5) + 1;
  const gm = mod(div(i, 153), 12) + 1;
  const gy = div(j, 1461) - 100100 + div(8 - gm, 6);
  return { gy, gm, gd };
}

// ─── Jalali leap-year & march day (Borkowski) ───────────────────────────────
function jalCal(jy: number): { leap: number; gy: number; march: number } {
  const breaks = [
    -61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210, 1635, 2060, 2097,
    2192, 2262, 2324, 2394, 2456, 3178,
  ];
  const bl = breaks.length;
  const gy = jy + 621;
  let leapJ = -14;
  let jp = breaks[0];
  let jm = 0;
  let jump = 0;

  for (let i = 1; i < bl; i += 1) {
    jm = breaks[i];
    jump = jm - jp;
    if (jy < jm) break;
    leapJ = leapJ + div(jump, 33) * 8 + div(mod(jump, 33), 4);
    jp = jm;
  }
  let n = jy - jp;
  leapJ = leapJ + div(n, 33) * 8 + div(mod(n, 33) + 3, 4);
  if (mod(jump, 33) === 4 && jump - n === 4) leapJ += 1;
  const leapG = div(gy, 4) - div((div(gy, 100) + 1) * 3, 4) - 150;
  const march = 20 + leapJ - leapG;
  if (jump - n < 6) n = n - jump + div(jump + 4, 33) * 33;
  let leap = mod(mod(n + 1, 33) - 1, 4);
  if (leap === -1) leap = 4;
  return { leap, gy, march };
}

// ─── Gregorian → Jalali (raw parts) ─────────────────────────────────────────

function gregorianToJalali(
  gy: number,
  gm: number,
  gd: number,
): ShamsiDate {
  return d2j(g2d(gy, gm, gd));
}

function d2j(jdn: number): ShamsiDate {
  const gy = d2g(jdn).gy;
  let jy = gy - 621;
  const r = jalCal(jy);
  const jdn1f = g2d(gy, 3, r.march);
  let k = jdn - jdn1f;
  if (k >= 0) {
    if (k <= 185) {
      const jm = 1 + div(k, 31);
      const jd = 1 + mod(k, 31);
      return { y: jy, m: jm, d: jd };
    }
    k -= 186;
  } else {
    jy -= 1;
    k += 179;
    if (r.leap === 1) k += 1;
  }
  const jm = 7 + div(k, 30);
  const jd = 1 + mod(k, 30);
  return { y: jy, m: jm, d: jd };
}

// ─── Public API ─────────────────────────────────────────────────────────────

/** تبدیل Date میلادی به ShamsiDate خام ({y, m, d}). */
export function toShamsiParts(gregorian: Date): ShamsiDate {
  return gregorianToJalali(
    gregorian.getFullYear(),
    gregorian.getMonth() + 1, // JS months are 0-based
    gregorian.getDate(),
  );
}

const PERSIAN_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

/** تبدیل اعداد انگلیسی به فارسی. ورودی string یا number. */
export function toPersianDigits(input: string | number): string {
  return String(input).replace(/[0-9]/g, (d) => PERSIAN_DIGITS[Number(d)] ?? d);
}

const SHAMSI_MONTH_NAMES = [
  "فروردین",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند",
];

/** نام ماه شمسی (۱-۱۲). خارج از بازه → رشته‌ی خالی. */
export function shamsiMonthName(month: number): string {
  if (month < 1 || month > 12) return "";
  return SHAMSI_MONTH_NAMES[month - 1] ?? "";
}

/**
 * toShamsi(date): string → "۱۴۰۲/۰۵/۱۸" (کوتاه، با اعداد فارسی).
 * (طبق قرارداد Task 25-A.)
 */
export function toShamsi(date: Date): string {
  const { y, m, d } = toShamsiParts(date);
  return toPersianDigits(
    `${y}/${String(m).padStart(2, "0")}/${String(d).padStart(2, "0")}`,
  );
}

/**
 * toShamsiLong(date): string → "۱۸ مرداد ۱۴۰۲" (بلند، با اعداد فارسی).
 * (طبق قرارداد Task 25-A.)
 */
export function toShamsiLong(date: Date): string {
  const { y, m, d } = toShamsiParts(date);
  return `${toPersianDigits(d)} ${shamsiMonthName(m)} ${toPersianDigits(y)}`;
}

/**
 * toRelative(date): string → تاریخ نسبی به فارسی.
 * (طبق قرارداد Task 25-A.)
 *   < ۱ دقیقه → "الان"
 *   < ۶۰ دقیقه → "N دقیقه پیش"
 *   < ۲۴ ساعت → "N ساعت پیش"
 *   ۱ روز → "دیروز"
 *   < ۷ روز → "N روز پیش"
 *   < ۱۴ روز → "هفته‌ی گذشته"
 *   < ۳۰ روز → "N روز پیش"
 *   ≥ ۳۰ روز → toShamsiLong
 */
export function toRelative(date: Date): string {
  const now = Date.now();
  const then = date.getTime();
  const diffMs = now - then;
  const past = diffMs >= 0;
  const abs = Math.abs(diffMs);

  const sec = Math.floor(abs / 1000);
  const min = Math.floor(sec / 60);
  const hr = Math.floor(min / 60);
  const day = Math.floor(hr / 24);

  const suffix = past ? "پیش" : "بعد";

  if (sec < 60) return "الان";
  if (min < 60) return `${toPersianDigits(min)} دقیقه ${suffix}`;
  if (hr < 24) return `${toPersianDigits(hr)} ساعت ${suffix}`;
  if (day === 1) return "دیروز";
  if (day < 7) return `${toPersianDigits(day)} روز ${suffix}`;
  if (day < 14) return "هفته‌ی گذشته";
  if (day < 30) return `${toPersianDigits(day)} روز ${suffix}`;
  return toShamsiLong(date);
}

/** "مرداد ۱۴۰۳" — لیبل ماه شمسی جاری. */
export function currentShamsiMonthLabel(): string {
  const { y, m } = toShamsiParts(new Date());
  return `${shamsiMonthName(m)} ${toPersianDigits(y)}`;
}

/** آیا تاریخ در ماه شمسی جاری است؟ (برای stats thisMonth) */
export function isCurrentShamsiMonth(date: Date): boolean {
  const now = toShamsiParts(new Date());
  const d = toShamsiParts(date);
  return now.y === d.y && now.m === d.m;
}
