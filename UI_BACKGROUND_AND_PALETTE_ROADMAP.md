# نقشه‌راه: بازطراحی بک‌گراند و پالت رنگی سایت

**نسخه:** ۲ — بازنویسی پس از نقد
**تاریخ:** ۲۰۲۶-۰۸-۰۴
**وضعیت:** پیشنهاد — منتظر تأیید

---

## ۰. مشکل فعلی (تحلیل واقع‌بینانه)

سایت یه صفحه‌ی تیره‌ی یکنواخته. وقتی اسکرول می‌کنی:

1. **Hero** ← تنها بخش با عمق واقعی (grid pattern + ۳ radial gradient + mask)
2. **Journey (6 بخش)** ← همه `background: var(--bg)` = `#0a0a0c` صاف. ambient line = `1px` با opacity `0.18-0.6` → تقریباً نامرئی
3. **Connect** ← `::before` با radial gradient طلایی ضعیف (opacity 0.04)
4. **Synthesis** ← پیچیده‌ترین بک‌گراند (۳-۴ لایه + vignette + seam)
5. **Projects** ← seam gradient وصل به Synthesis

**نتیجه:** کل سایت یه تکه سیاهِ بدون ریتمه. مرز بین بخش‌ها معلوم نیست.

### مشکلات پالت:
- `--accent` قبلاً verdigris (`#3A6B6B`) بود، الان gold (`#D4AF6A`) شده → **تمام تعاملات تک‌رنگ طلایی** شده
- verdigris فقط توی focus ring و ambient line مونده
- Synthesis و Projects هر کدوم کل توکن‌ها رو local override می‌کنن → ۲۲ خط تکراری

---

## ۱. محدودیت‌های فنی (قبل از شروع)

### ۱-الف. Pseudo-element occupancy

هر section فقط `::before` و `::after` داره. اگه یکی مشغول باشه، فقط اون یکی می‌مونه:

| Section | `::before` | `::after` | آزاد |
|---|---|---|---|
| Hero (`.page`) | ✅ مشغول (gradients) | ✅ مشغول (grid) | ❌ هیچکدوم |
| WhoAmI | ✅ آزاد | ✅ آزاد | ✅ هر دو |
| WhatIBuild | ✅ آزاد (فقط `.buildCard`) | ✅ آزاد (فقط `.buildCard`) | ✅ هر دو |
| WhereIFrom | ✅ آزاد | ✅ آزاد | ✅ هر دو |
| WhereIGo | ✅ آزاد (فقط `.timelineDot`) | ✅ آزاد | ✅ هر دو |
| OpenQuestions | ✅ آزاد | ✅ آزاد | ✅ هر دو |
| **Connect** | **❌ مشغول** (radial gradient) | ✅ آزاد | ⚠️ فقط `::after` |
| Synthesis | ✅ آزاد (فقط `.forgeFloor`) | ❌ مشغول (فقط `.forgeFloor`) | ⚠️ فقط `::before` |
| Projects | ✅ آزاد (فقط `.threadBridge`) | ✅ آزاد (فقط `.threadBridge`) | ✅ هر دو |

**نتیجه:** Connect فقط `::after` داره. Hero هیچکدوم رو نداره. بقیه آزادن.

### ۱-ب. Local token overrides — حذف نکن

Synthesis (خط ۱۲-۳۶) و Projects (خط ۱۱-۳۱) local override دارن. اینا **عمدی** هستن — به‌عنوان fallback عمل می‌کنن اگه globals.css دیر لود بشه (SSR, chunk loading). حذفشون خطرناکه. فقط مقدارشون باید با globals.css هماهنگ باشه (که الان هست).

### ۱-ج. Just-Noticeable Difference (JND)

تفاوت رنگ روی پس‌زمینه تیره باید ≥ ۳ L* واحد باشه تا چشم ببینه. پیشنهاد نسخه ۱ (`#0a0a0c` vs `#0c0b0f`) = ΔL* ≈ ۱.۲ → **نامرئی**. راه‌حل: gradient transition بین بخش‌ها (نه tint ثابت).

---

## ۲. اهداف طراحی

| هدف | معیار | نحوه‌ی سنجش |
|---|---|---|
| **ریتم بصری** | هر بخش هویت بصری مجزا | اسکرول کن، ببین مرزها معلومن |
| **عمق واقعی** | حداقل ۲ لایه (بک‌گراند + gradient) | لایه‌شماری در DevTools |
| **مرز نرم** | gradient transition بین بخش‌ها | بدون خط تیز |
| **پالت دو-رنگه** | Gold + Verdigris (نه همه طلایی) | بررسی توکن‌ها |
| **سبکی** | opacity < 0.06 برای gradient ها | بررسی computed style |
| **.performance** | بدون JS اضافه، فقط CSS | Lighthouse |

---

## ۳. پالت جدید

### ۳-الف. توکن‌های جدید (اضافه به globals.css)

```css
/* === Section background tints ===
   هر کدوم یه گرادیان transition ایجاد می‌کنه، نه رنگ ثابت.
   مقادیر برای gradient stops استفاده می‌شن، نه background-color. */
--bg-journey-start: #0a0a0c;    /* Hero → Journey: بدون شکست */
--bg-journey-mid: #0d0c10;      /* وسط Journey: کمی warm-cool (بنفش خفیف) */
--bg-open: #0d0c0a;             /* OpenQuestions: warm paper */
--bg-connect-mid: #0c0b0e;      /* Connect: transition zone */
--bg-synthesis: #0a0b0e;        /* Synthesis: cool */
```

```css
/* === Verdigris refresher ===
   الان --accent = gold. verdigris فقط توی focus ring مونده.
   برای دو-رنگه بودن پالت، verdigris باید برگرده به تعاملات次要. */
--verdigris: #3A6B6B;           /* از قبل هست */
--verdigris-bright: #4DB8B8;    /* hover state */
--verdigris-rgb: 58, 107, 107;  /* برای rgba() */
--verdigris-soft: rgba(58, 107, 107, 0.12);
```

### ۳-ب. تغییرات توکن موجود

```css
/* globals.css — تغییر در بخش Gold Standard override */
--accent: var(--verdigris);     /* از #d4af6a → verdigris */
--accent-bright: #4DB8B8;      /* از #e6c585 → verdigris bright */
--accent-deep: #2D5555;        /* از #b08d4a → verdigris deep */
--accent-soft: rgba(58, 107, 107, 0.16);  /* از gold → verdigris */
--accent-glow: rgba(58, 107, 107, 0.32);

/* --highlight برای لحظات طلایی حفظ می‌شه */
--highlight: #D4AF6A;          /* gold — برای CTA، emphasis */
--highlight-soft: rgba(212, 175, 106, 0.15);
--highlight-rgb: 212, 175, 106;
```

`★ Insight ─────────────────────────────────────`
**چرا `--accent` باید برگرده به verdigris؟** الان `--accent` = gold و `--highlight` = gold → هیچ تمایزی نیست. اگه `--accent` = verdigris بشه، تعاملات (لینک‌ها، فوکوس، CTA ثانویه) سبز-آبی می‌شن و `--highlight` = gold برای لحظات تأکیدی (عنوان‌ها، CTA اصلی) می‌مونه. این دقیقاً همون الگوییه که قبلاً توی globals.css اولیه بود (خط ۸۰: `--accent: var(--verdigris)`) قبل از اینکه Gold Standard override همه‌چی رو طلایی کنه.
`─────────────────────────────────────────────────`

### ۳-ج. نقشه رنگ هر بخش (بازبینی‌شده)

| بخش | رنگ غالب | Gradient رنگی | opacity |
|---|---|---|---|
| **Hero** | Gold glow (از قبل) | radial-gradient با ochre | 0.06-0.08 |
| **WhoAmI** | Verdigris خفیف | `radial-gradient(at 20% 50%, verdigris)` | 0.04 |
| **WhatIBuild** | Gold خفیف | `radial-gradient(at 80% 50%, gold)` | 0.04 |
| **WhereIFrom** | Gold map (از قبل) | gold-iran.svg + olive wash | 0.2 (از 0.16) |
| **WhereIGo** | Verdigris خفیف | `radial-gradient(at 80% 50%, verdigris)` | 0.035 |
| **OpenQuestions** | Warm paper | `radial-gradient(at 50% 50%, gold)` | 0.03 |
| **Connect** | Gold → Verdigris | gradient line (از قبل) | — |
| **Synthesis** | Hot gold (از قبل) | radial + vignette (دست‌نخورده) | — |
| **Projects** | Cool neutral (از قبل) | seam gradient (دست‌نخورده) | — |

---

## ۴. فازها (بازبینی‌شده)

### فاز ۰: توکن‌ها (globals.css)

**تغییرات:**
1. اضافه کردن توکن‌های جدید (`--bg-journey-mid`, `--verdigris-bright`, `--verdigris-rgb`, `--verdigris-soft`)
2. تغییر `--accent` از gold به verdigris
3. اضافه کردن `--highlight` و `--highlight-rgb` به‌عنوان gold wrapper

**فایل:** `globals.css` — فقط بخش Gold Standard override (خطوط ۱۶۶-۲۰۰)

**⚠️ نکته:** Synthesis و Projects local overrides رو **حذف نکن** — فقط مطمئن شو مقدارهاشون با globals.css جدید هماهنگه. اگه `--accent` عوض بشه، باید مقدار local هم عوض بشه.

**تست:** `tsc --noEmit` + `eslint` + visual check روی Hero (ببین focus ring هنوز visible هست)

---

### فاز ۱: Ambient line قوی‌تر

**فایل:** `Journey.module.css`

**تغییرات:**
```css
.ambientLine {
  /* از 1px → 2px با blur خفیف */
  width: 2px;
  filter: blur(0.5px);
  opacity: 0.7;  /* از 0.6 */
  background: linear-gradient(
    180deg,
    transparent 0%,
    rgba(var(--highlight-rgb, 212, 175, 106) / 0.22) 10%,
    rgba(var(--highlight-rgb, 212, 175, 106) / 0.14) 35%,
    rgba(var(--verdigris-rgb, 58, 107, 107) / 0.16) 65%,
    rgba(var(--highlight-rgb, 212, 175, 106) / 0.08) 90%,
    transparent 100%
  );
}

.ambientGlow {
  filter: blur(60px);  /* از 40px */
  opacity: 0.7;        /* از 0.6 */
}
```

**موبایل:** opacity کمتر (0.3 برای line، 0.5 برای glow)

**تست:** scroll از WhoAmI تا WhereIGo — خط باید قابل‌دیدن باشه ولی مزاحم نباشه

---

### فاز ۲: عمق‌بخشی به Journey subsections

**⚠️ مهم:** Hero از `::before` و `::after` استفاده می‌کنه → نمی‌تونیم pseudo-element اضافه کنیم. فقط ambient gradient کافیه.

**الگو:** هر section یه `::before` با radial gradient خیلی ضعیف. opacity 0.035-0.04 → این مقدار روی `#0a0a0c` **قابل‌دیدنه** (ΔL* ≈ ۳.۵-۴).

#### WhoAmI (`WhoAmI.module.css`)
```css
.whoAmI::before {
  content: "";
  position: absolute;
  inset: 0;
  background: radial-gradient(
    60% 50% at 20% 50%,
    rgba(var(--verdigris-rgb, 58, 107, 107) / 0.04) 0%,
    transparent 70%
  );
  pointer-events: none;
}
```

#### WhatIBuild (`WhatIBuild.module.css`)
```css
.whatIBuild::before {
  content: "";
  position: absolute;
  inset: 0;
  background: radial-gradient(
    60% 50% at 80% 50%,
    rgba(var(--highlight-rgb, 212, 175, 106) / 0.04) 0%,
    transparent 70%
  );
  pointer-events: none;
}
```

#### WhereIFrom (`WhereIFrom.module.css`)
```css
.mapBg { opacity: 0.2; }  /* از 0.16 → 0.2 (نقشه قوی‌تر) */
```
(بدون pseudo-element جدید — از قبل `mapBg` هست)

#### WhereIGo (`WhereIGo.module.css`)
```css
.whereIGo::before {
  content: "";
  position: absolute;
  inset: 0;
  background: radial-gradient(
    60% 50% at 80% 50%,
    rgba(var(--verdigris-rgb, 58, 107, 107) / 0.035) 0%,
    transparent 70%
  );
  pointer-events: none;
}
```

**⚠️ توجه:** WhoAmI, WhatIBuild, WhereIFrom, WhereIGo باید `position: relative` داشته باشن (برای `position: absolute` روی `::before`). بررسی کن قبلاً دارن یا نه.

**تست:** scroll缓慢 — هر بخش باید یه هویت رنگی خفیف داشته باشه. WhoAmI سمت چپ cool، WhatIBuild سمت راست warm.

---

### فاز ۳: Journey → OpenQuestions transition

**فایل:** `OpenQuestions.module.css`

**تغییرات:**
```css
.openQuestions {
  /* gradient transition از Journey به OpenQuestions */
  background:
    radial-gradient(
      80% 50% at 50% 50%,
      rgba(var(--highlight-rgb, 212, 175, 106) / 0.03) 0%,
      transparent 70%
    ),
    linear-gradient(180deg,
      var(--bg) 0%,              /* از Journey */
      #0d0c0a 15%,               /* warm paper tint */
      #0d0c0a 85%,
      var(--bg) 100%             /* به Connect */
    );
}
```

**⚠️ نکته:** `--bg` و `#0d0c0a` فقط ۲-۳ کانال تفاوت دارن. gradient transition باعث می‌شه چشم تغییر رو «حس» کنه بدون اینکه یه خط تیز ببینه. اگه opacity ثابت (0.03) باشه، ΔL* ≈ ۱.۲ → نامرئی. **gradient لازمه، نه ثابت.**

**تست:** scroll از WhereIGo به OpenQuestions — باید یه «گرم‌تر شدن» خفیف حس بشه

---

### فاز ۴: Connect → Synthesis transition

**فایل:** `Connect.module.css`

**⚠️ محدودیت:** `.connect::before` **مشغوله** (radial gradient طلایی). باید از `::after` استفاده کنیم.

**تغییرات:**
```css
.connect::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg,
    transparent 0%,
    rgba(var(--gold-rgb) / 0.02) 30%,
    rgba(10, 11, 14, 0.8) 100%   /* تقریباً --bg-synthesis */
  );
  pointer-events: none;
  z-index: 0;
}
```

**⚠️ نکته:** radial gradient قبلی (خط ۱۵-۲۲) رو **نگه‌دار** — فقط `::after` اضافه کن. این دوتا باهم کار می‌کنن چون z-index متفاوت دارن.

**تست:** scroll از Connect به Synthesis — باید یه «تاریک‌تر شدن خفیف» حس بشه

---

### فاز ۵: Synthesis + Projects — token sync

**⚠️ حذف نکن. فقط مقدارها رو هماهنگ کن.**

اگه فاز ۰ `--accent` رو از gold به verdigris عوض کرد، باید مقدار local `--accent` در Synthesis و Projects هم عوض بشه:

```css
/* Synthesis.module.css — خط ۲۰ */
--accent: #3A6B6B;  /* از #d4af6a → verdigris */

/* Projects.module.css — خط ۱۸ */
--accent: #3A6B6B;  /* از #d4af6a → verdigris */
```

**⚠️ `--seam` رو به globals منتقل نکن** — اگه یه‌جا عوض بشه و اون یکی فراموش بشه، مرز بین Synthesis و Projects خط افقی می‌افته. نگه‌داشتن local امن‌تره.

**تست:** scroll از Synthesis به Projects — seam باید نامرئی باشه (بدون خط)

---

## ۵. چیزی که نباید عوض بشه

- `--ink-black: #0B0B0C` — پایه رنگی
- `--parchment: #F5F0E8` — متن اصلی
- `--gold: #D4AF6A` — رنگ اول
- `--highlight` — gold برای لحظات تأکیدی
- Synthesis complex background — دست‌نخورده (فقط token sync)
- Projects seam gradient — دست‌نخورده
- Hero `::before` / `::after` — مشغوله، دست نزن
- Connect `::before` — مشغوله، از `::after` استفاده کن
- `prefers-reduced-motion` — همه gradient ها باید override بشن
- SSR safety — بدون JS اضافه
- Contrast ratios — ≥ 4.5:1 برای متن

---

## ۶. اولویت و تخمین (بازبینی‌شده)

| فاز | سختی | تأثیر | فایل‌ها | خطر | تخمین |
|---|---|---|---|---|---|
| **۰** توکن‌ها | متوسط | ⭐⭐⭐⭐ | globals.css, Synthesis, Projects | متوسط (accidental break) | ۲۰ دقیقه |
| **۱** Ambient line | آسان | ⭐⭐⭐ | Journey.module.css | کم | ۱۰ دقیقه |
| **۲** Journey depth | متوسط | ⭐⭐⭐⭐⭐ | 4 فایل CSS | متوسط (pseudo conflict) | ۳۰ دقیقه |
| **۳** OpenQuestions | آسان | ⭐⭐ | OpenQuestions.module.css | کم | ۱۰ دقیقه |
| **۴** Connect | آسان | ⭐⭐ | Connect.module.css | کم (pseudo آزاد) | ۱۰ دقیقه |
| **۵** Token sync | آسان | ⭐ | Synthesis, Projects | متوسط (seam break) | ۱۰ دقیقه |
| **تست نهایی** | — | — | مرورگر | — | ۲۰ دقیقه |

**مجموع: ~۱۱۰ دقیقه (~۲ ساعت)**

---

## ۷. قبل / بعد (واقع‌بینانه)

**الان:**
```
┌──────────────────────────┐
│ Hero: grid + glow ✅      │  عمق واقعی
│ ─── ambient line ─────── │  نامرئی
│ WhoAmI: صاف              │  بدون هویت
│ WhatIBuild: صاف          │  بدون هویت
│ WhereIFrom: map 0.16     │  کم‌رنگ
│ WhereIGo: صاف            │  بدون هویت
│ OpenQuestions: صاف        │  بدون هویت
│ Connect: radial 0.04     │  خیلی ضعیف
│ Synthesis: 3 gradients ✅ │  پیچیده
│ Projects: seam ✅         │  خوب
└──────────────────────────┘
```

**بعد:**
```
┌──────────────────────────┐
│ Hero: grid + glow ✅      │  (دست‌نخورده)
│ ─── ambient 2px gold→vg ─│  قابل‌دیدن
│ WhoAmI: ◯ verdigris 0.04 │  هویت cool
│ WhatIBuild: ◯ gold 0.04  │  هویت warm
│ WhereIFrom: map 0.20     │  قوی‌تر
│ WhereIGo: ◯ verdigris 0.035│ هویت cool
│ OpenQuestions: 📝 warm     │  حس کاغذ
│ Connect: gradient → synth │  transition نرم
│ Synthesis: 3 gradients ✅ │  (دست‌نخورده)
│ Projects: seam ✅         │  (دست‌نخورده)
└──────────────────────────┘
```

**تغییرات واقعی:**
- ambient line: ۱px → ۲px، opacity ↑، gold→verdigris gradient
- ۳ بخش Journey: radial gradient خفیف (0.035-0.04 opacity)
- WhereIFrom: map opacity ↑
- OpenQuestions: warm tint + radial gradient
- Connect: `::after` gradient transition
- **پالت:** `--accent` از gold → verdigris (برگشت به حالت اولیه)

---

## ۸. خطرات (بازبینی‌شده)

| خطر | شدت | احتمال | راه‌حل |
|---|---|---|---|
| `--accent` تغییر رنگ CTA ها رو خراب کنه | بالا | متوسط | تست تمام لینک‌ها و دکمه‌ها بعد از فاز ۰ |
| Gradient transition نامرئی باشه | متوسط | متوسط | opacity ≥ 0.035 + gradient (نه ثابت) |
| Connect `::after` با `::before` conflict کنه | متوسط | کم | z-index متفاوت + بررسی computed style |
| Synthesis token sync خراب بشه | بالا | کم | فقط مقدار `--accent` عوض بشه، بقیه دست نخوره |
| Ambient line توی موبایل مزاحم بشه | متوسط | متوسط | opacity 0.3 روی موبایل |
| `prefers-reduced-motion` فراموش بشه | بالا | کم | اضافه کردن override برای هر pseudo-element جدید |
| مانیتور ارزان gradient رو نبینه | متوسط | متوسط | gradient ها خیلی ضعیفن (0.035) → اگه دیده نشه ضرری نداره |
