/* =========================================================
 * Hero — Six raw thoughts (design spec §5)
 *
 * Each thought is intentionally specific to طاها حسینی:
 * Taskino, Mind 2.0, علوم انسانی × کد, circadian, offline-first, meta.
 *
 * Positions are hand-tuned (not random) for "scattered but composed".
 * ========================================================= */

import type { Thought } from "./types";

export const THOUGHTS: Thought[] = [
  {
    id: "t1",
    raw: "چرا هیچ اپلیکیشنی شبیه مغز من نیست؟",
    refined:
      "Taskino؛ گذار از فهرست‌های خطی به شبکه‌های معنایی. ذهن انسان در ماتریس‌ها زیست می‌کند، نه در صف‌های بی‌پایان.",
    label: "#taskino",
    timestamp: "۱۴۰۲/۰۵/۱۸ — ۰۲:۴۱",
    mode: 2,
    rotation: 0,
    traceDuration: 6000,
    driftDuration: 4200,
    // Loop-4 (Task 12 §4.2): positionDesktop حالا polar coordinates از
    // مرکز hero 1180×780 است (نه minimax از 380px scatterCol). چیدمان
    // مرکزی: text در مرکز، chips در گوشه‌ها/پهلوها. t1 گوشه‌ی بالا-چپ،
    // gap 35px با eyebrow.
    positionDesktop: { top: "6%", left: "4%" },
    positionMobile: { top: "3%", left: "5%" },
  },
  {
    id: "t2",
    raw: "یه هزار یادداشت، هیچی پیدا نمیشه.",
    refined:
      "Mind 2.0: بازآرایی دانش. یادداشتی که فاقد غایت و خاستگاه باشد، نویز است، نه آگاهی.",
    label: "#mind2.0",
    timestamp: "۱۴۰۲/۰۶/۰۲ — ۲۳:۱۸",
    mode: 1,
    rotation: -2,
    traceDuration: 7500,
    driftDuration: 6000,
    // Loop-4: گوشه‌ی بالا-راست، gap 10px با eyebrow (tight اما OK).
    positionDesktop: { top: "7.5%", left: "70%" },
    positionMobile: { top: "13%", left: "56%" },
  },
  {
    id: "t3",
    raw: "همه میگن علوم انسانی بی‌فایده‌ست.",
    refined:
      "کدنویسی، هرموتیکِ مدرن است. دیالکتیکِ هگل و ساختارگراییِ فوکو، بنیادی‌ترین الگوریتم‌ها برای درک جهان دیجیتال هستند.",
    label: "#humanities×code",
    timestamp: "۱۴۰۲/۰۴/۱۱ — ۱۶:۲۵",
    mode: 3,
    rotation: 0.5,
    usesDanger: true,
    traceDuration: 9000,
    driftDuration: 5400,
    // Loop-4: پهلوی چپ، هم‌سطح h1/description، gap 18px با text.
    positionDesktop: { top: "39%", left: "0%" },
    positionMobile: { top: "33%", left: "4%" },
  },
  {
    id: "t4",
    raw: "ساعت ۲:۱۴ صبح، مغز روشن.",
    refined:
      "خلاقیتِ شبانه‌روزی. ایده‌ای که در ۰۲:۱۴ متولد می‌شود، اصیل‌ترین مواجهه‌ی ذهن با ناخودآگاه است.",
    label: "#circadian",
    timestamp: "۱۴۰۲/۰۵/۲۷ — ۰۲:۱۴",
    mode: 4,
    rotation: 0,
    traceDuration: 8000,
    driftDuration: 4800,
    // Loop-4: پهلوی راست، هم‌سطح description، gap 30px با text.
    positionDesktop: { top: "47%", left: "72%" },
    positionMobile: { top: "47%", left: "56%" },
  },
  {
    id: "t5",
    raw: "مترو صبح، اینترنت قطع، ایده‌ها کجان؟",
    refined:
      "معماریِ تاب‌آور. در جهانی که اتصال ناپایدار است، سیستم باید در انزوا نیز حیات داشته باشد.",
    label: "#offline-first",
    timestamp: "۱۴۰۲/۰۳/۰۹ — ۰۷:۴۲",
    mode: 1,
    rotation: 1.5,
    traceDuration: 7000,
    driftDuration: 5800,
    // Loop-4: گوشه‌ی پایین-چپ، gap 20px با CTA.
    positionDesktop: { top: "76%", left: "7%" },
    positionMobile: { top: "66%", left: "8%" },
  },
  {
    id: "t6",
    raw: "۱۶ ساله‌ام، چرا اصلا پورتفولیو ساختم؟",
    refined:
      "زمان‌سنجِ خودآگاهی. این پورتفولیو نه برای نمایش، که برای رصدِ تطورِ فکری‌ست.",
    label: "#meta",
    timestamp: "۱۴۰۲/۰۷/۰۱ — ۱۵:۰۳",
    mode: 2,
    rotation: -1,
    isEscaped: true,
    traceDuration: 10000,
    driftDuration: 6400,
    // Loop-4: گوشه‌ی پایین-راست.
    positionDesktop: { top: "88%", left: "74%" },
    positionMobile: { top: "78%", left: "54%" },
  },
];
