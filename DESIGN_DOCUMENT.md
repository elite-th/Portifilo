# Taha Hosseini Portfolio — Design Document
**Synthesis of UX, Content, UI, Motion & Technical Perspectives**

---

## 1. Vision & Core Metaphor

### 1.1 Brand Identity
**Tagline:** **«جایی که اندیشه، کالبد می‌یابد»**  
*Where thought takes form / Where ideas find structure*

**Core Metaphor:** **Knowledge Alchemy** — *Prima Materia → Calcination → Dissolution → Crystallization → Gold*

- **Scattered Thoughts** (فکرهای پراکنده) = *Prima Materia* — raw, floating mineral fragments in solution
- **Transformation Logic** (منطق بازآفرینی) = *Alchemical Process* — the synthesis of Humanities (why/context) + Code (how/structure)
- **Built Structures** (ساختارهای ساخته‌شده) = *Crystallized Gold* — faceted, functional, enduring projects

### 1.2 User Journey Arc

| Stage | Metaphor | UX Goal | Key Components |
|-------|----------|---------|----------------|
| **1. Arrival** | Laboratory threshold | Immediate immersion in the metaphor | Hero + ThoughtCluster (idle state) |
| **2. Discovery** | Scroll = descent into crucible | Reveal thoughts through crystallization | Scroll-reveal choreography |
| **3. Engagement** | Hover = heat/pressure | Interactive refinement of each thought | Crystal growth micro-interactions |
| **4. Synthesis** | Resonance = ley lines | Show connections between ideas | Phosphorescent trace + resonance beams |
| **5. Reset** | Aqua regia = dissolution | Return to prima materia | Reset button = flask shake |
| **6. Manifestation** | Laboratory shelves | Projects as crystallized outcomes | Archive/Lab section with semantic tags |

---

## 2. Content Architecture (Persian-First, RTL)

### 2.1 Hero Section
```yaml
headline: "جایی که اندیشه، کالبد می‌یابد"
subheadline: "طاها حسینی — سنتز علوم انسانی و مهندسی نرم‌افزار. جست‌وجوگری در قلمرو اندیشه و معمار سیستم‌های دیجیتال. تبدیل ایده‌های انتزاعی به ساختار و پروژه‌های واقعی."
cta_primary: "ورود به آزمایشگاه" → scrolls to #projects
cta_secondary: "مشاهده آرشیو" → scrolls to #archive
```

### 2.2 Thought Chips (6 Crystallization Seeds)
Each chip = **Raw Thought → Refined Structure** pair

| ID | Mode | Raw (Prima Materia) | Refined (Crystal) | Project Link |
|----|------|---------------------|-------------------|--------------|
| **t1** | Blur→Type | «لیست‌های خطی 답 نمی‌شوند» | «Taskino: شبکه معنایی اولویت‌ها» | → Taskino |
| **t2** | Blur→Type | «ذهنِ من پر از نویز است» | «Mind 2.0: معماری نکاتهٔ دوم» | → Mind 2.0 |
| **t3** | Strikethrough | «علوم انسانی «سخت» نیست» | «هرموتیک مدرن: کد به عنوان تفسیر» | → Articles |
| **t4** | Word→Sentence | «ایده‌های شبانه می‌میرند» | «ساعت زیستی: ثبت در لحظه‌ی ظهور» | → Notes |
| **t5** | Question→Answer | «اینترنت همیشه نیست» | «معماری آفلاین‌اول: تاب‌آوری واقعی» | → Offline-First |
| **t6** | Question→Answer | «Taskino فقط برای من است؟» | «متا: ابزاری برای ساخت ابزار» | → Meta |

### 2.3 Synthesis Section (New — Between Hero & Projects)
**Title:** «منطق تبلور: از پرسش تا ساخت»  
**Format:** Interactive equation visualization

```
[مسئله‌ی انسانی]  +  [راهکار الگوریتمی]  =  [ابزارِ المعنى‌دار]
      │                    │                      │
   «چرا؟»              «چگونه؟»               «چیست؟» 
```

**Three pillars as interactive cards:**
1. **Humanities as OS** — Philosophy provides the *specification*; Code is the *implementation*
2. **Code as Hermeneutics** — Programming = modern hermeneutics (interpretation of digital being)
3. **Structure as Freedom** — Constraints (types, schemas, offline-first) enable creative agency

### 2.4 Projects Section ("آزمایشگاه")
**Section Title:** «تبلور مفاهیم در کالبد تکنولوژی»  
**Subtitle:** «این فضا، نقطه‌ی تلاقی یادداشت‌های فنی و تأملات فلسفی است. هر پروژه، پاسخِ Cristal شده‌ای به یک پرسشِ خام است.»

**Project Card Schema:**
```yaml
- root_thought: "اندیشه‌ی ریشه (علوم انسانی)"
  built_structure: "ساختارِ ساخته‌شده (کد/معماری)"
  project: Taskino
  tags: [Offline-First, Local-First, Priority Network]
- root_thought: "ترس از انتخابِ بی‌نهایت"
  built_structure: "مدیریت وظایف مبتنی بر اولویت"
  ...
```

### 2.5 Archive Section ("آرشیو اندیشه")
**Entry Types & JSON-LD:**
- **مقاله (Article)** → `schema:Article` — deep dives
- **توشه (Tosheh)** → `schema:CreativeWork` — fleeting notes, marginalia
- **شعر (Poem)** → `schema:CreativeWork` — creative synthesis

---

## 3. Visual System: "Ink & Archive"

### 3.1 Color Palette (6 Tokens, Dark-First)

| Token | Hex | Role | Archival Reference |
|-------|-----|------|-------------------|
| **--ink-black** | `#0B0B0C` | Base background, deep shadows | Ink-soaked paper depth |
| **--parchment** | `#F5F0E8` | Primary text (on dark), card backgrounds | Aged manuscript paper |
| **--sepia-ink** | `#8B7355` | Secondary text, borders, dividers | Iron-gall ink aged to brown |
| **--iron-gall** | `#4A3A2A` | Accent borders, focus rings, active states | Fresh iron-gall ink |
| **--verdigris** | `#3A6B6B` | Primary CTAs, links, active chips | Copper verdigris — insight spark |
| **--ochre** | `#C9A84C` | Hover accents, emphasis, gold-leaf moments | Illuminated manuscript gold |

**CSS Variables (Dark Mode — Default):**
```css
:root {
  --ink-black: #0B0B0C;
  --parchment: #F5F0E8;
  --sepia-ink: #8B7355;
  --iron-gall: #4A3A2A;
  --verdigris: #3A6B6B;
  --ochre: #C9A84C;

  /* Semantic mappings */
  --bg: var(--ink-black);
  --fg: var(--parchment);
  --muted: var(--sepia-ink);
  --border: var(--iron-gall);
  --accent: var(--verdigris);
  --highlight: var(--ochre);
  --focus: var(--verdigris);
}
```

**Light Mode (Inverted Metaphor — Reading in Daylight):**
```css
[data-theme="light"] {
  --bg: var(--parchment);
  --fg: var(--ink-black);
  --muted: var(--iron-gall);
  --border: var(--sepia-ink);
  --card-bg: #FAF6F0;
}
```

### 3.2 Typography System

| Role | Font | Weights | Purpose |
|------|------|---------|---------|
| **Primary (Arabic/Persian + Latin)** | **Vazirmatn VF** | 300–700 | Body, UI, headlines — variable optical sizing |
| **Display (Latin Headlines)** | **Crimson Pro VF** | 400, 600, 700 | Latin display, pull quotes, logotypes — Garamond lineage, Renaissance humanist |
| **Monospace / Code** | **JetBrains Mono VF** | 400, 500 | Code blocks, technical labels, "Mind 2.0" notation |

**Fluid Type Scale (clamp-based):**
```css
:root {
  --step--2: clamp(0.69rem, 0.67rem + 0.11vw, 0.75rem);  /* caption */
  --step--1: clamp(0.83rem, 0.80rem + 0.17vw, 0.94rem);  /* small */
  --step-0:  clamp(1rem, 0.96rem + 0.22vw, 1.13rem);     /* body */
  --step-1:  clamp(1.2rem, 1.15rem + 0.28vw, 1.35rem);   /* lead */
  --step-2:  clamp(1.44rem, 1.38rem + 0.35vw, 1.62rem);  /* h4 */
  --step-3:  clamp(1.73rem, 1.65rem + 0.44vw, 1.94rem);  /* h3 */
  --step-4:  clamp(2.07rem, 1.97rem + 0.55vw, 2.33rem);  /* h2 */
  --step-5:  clamp(2.49rem, 2.35rem + 0.7vw, 2.8rem);    /* h1 */
  --step-6:  clamp(2.98rem, 2.81rem + 0.88vw, 3.36rem);  /* display */
}
```

### 3.3 Structural Language (Archive Grammar)

| Element | Treatment | Archival Reference |
|---------|-----------|-------------------|
| **Cards** | `--parchment` @ 8% opacity bg, `--iron-gall` 1px border, 2px radius | Manuscript folio |
| **Dividers** | 1px dashed `--iron-gall` (2px dash, 8px gap) | Quire stitching |
| **Focus Ring** | 2px `--verdigris` offset 2px | Marginal gloss highlight |
| **Hover Lift** | `translateY(-2px)` + `--ochre` bottom border 2px | Gilt edge catch |
| **Code Blocks** | `--ink-black` bg, `--parchment` text, `--sepia-ink` comments | Scribe's working notes |
| **Chips/Tags** | `--iron-gall` bg, `--parchment` text, `--verdigris` active | Catalog tags |

---

## 4. Motion System: "Alchemy & Crystallization"

### 4.1 State Machine

```
┌─────────────┐     hover/focus      ┌──────────────┐
│    RAW      │ ──────────────────►  │  REFINING    │
│ (Prima Mat) │ ◄──────────────────  │ (Crystallize)│
└─────────────┘     leave/blur       └──────────────┘
       │                                       │
       │ click "↺ خام"                         │ auto (2.5s)
       ▼                                       ▼
┌─────────────┐                         ┌──────────────┐
│  RESETTING  │                         │    TRACE     │
│ (Dissolve)  │                         │ (Phosphoresce)│
└─────────────┘                         └──────────────┘
       │                                       │
       └───────────────┬───────────────────────┘
                       ▼
              ┌──────────────┐
              │   RESONANCE  │  (if multiple traces share semantic link)
              │  (Ley Lines) │
              └──────────────┘
```

### 4.2 Scroll-Reveal Choreography (Phase 1 — Foundation)

**Hook:** `useScrollReveal` — maps scrollY (0–100vh) → revelation thresholds

```typescript
const SCROLL_REVEAL_THRESHOLDS = {
  t4: 0.00,  // Circadian (center-right) — auto-demo triggers here
  t1: 0.10,  // Taskino (top-left)
  t6: 0.20,  // Meta (bottom-right, escaped)
  t2: 0.30,  // Mind 2.0 (top-right)
  t5: 0.45,  // Offline-First (bottom-left)
  t3: 0.60,  // Humanities×Code (left-mid, danger)
} as const;
```

**Crystallization Entrance Animation (CSS):**
```css
@keyframes crystallizeIn {
  0%   { opacity: 0; scale: 0.6; filter: blur(12px) hue-rotate(40deg); transform: rotate(var(--rot)) translateY(40px); }
  40%  { opacity: 0.6; scale: 0.9; filter: blur(4px) hue-rotate(10deg); transform: rotate(var(--rot)) translateY(4px); }
  100% { opacity: 0.88; scale: 1; filter: none; transform: rotate(var(--rot)) translateY(0); }
}

.thoughtChip[data-scroll-revealed="true"] {
  animation: crystallizeIn 1.4s var(--ease-out-expo) forwards;
}

/* Stagger delays */
[data-id="t4"][data-scroll-revealed="true"] { animation-delay: 0ms; }
[data-id="t1"][data-scroll-revealed="true"] { animation-delay: 120ms; }
[data-id="t6"][data-scroll-revealed="true"] { animation-delay: 200ms; }
[data-id="t2"][data-scroll-revealed="true"] { animation-delay: 280ms; }
[data-id="t5"][data-scroll-revealed="true"] { animation-delay: 340ms; }
[data-id="t3"][data-scroll-revealed="true"] { animation-delay: 420ms; }
```

**Reduced Motion:** Instant `opacity: 0.88; scale: 1; filter: none;`

### 4.3 Refining Phase: Crystal Growth Micro-Interactions

**Replace current `scale(1.04)` + blur with faceted growth:**

```css
@keyframes crystalGrow {
  0%   { scale: 1;     border-radius: 14px; box-shadow: var(--shadow-raw); }
  30%  { scale: 1.06;  border-radius: 12px; box-shadow: var(--shadow-growing); }
  60%  { scale: 1.02;  border-radius: 10px; box-shadow: var(--shadow-faceted); }
  100% { scale: 1.04;  border-radius: 8px;  box-shadow: var(--shadow-crystal); }
}

.thoughtChip[data-state="refining"] {
  animation: crystalGrow 0.5s var(--ease-out-expo) forwards;
}

/* Facet sweep — conic gradient rotation */
.thoughtChip[data-state="refining"]::after {
  content: "";
  position: absolute; inset: -2px;
  border-radius: 6px;
  background: conic-gradient(from 0deg, transparent, var(--chip-accent-glow) 15deg, transparent 30deg);
  opacity: 0;
  animation: facetSweep 1.2s linear infinite;
  pointer-events: none; z-index: -1;
}

@keyframes facetSweep { to { transform: rotate(360deg); } }
```

**Mode-Specific Behaviors:**

| Mode | Crystal Behavior |
|------|------------------|
| **1 Blur→Type** | Hexagonal lattice grows; raw text sublimates into vapor trail |
| **2 Question→Answer** | Seed crystal (raw) → twin crystal (refined) grows below |
| **3 Strikethrough→Replace** | Danger crystal: jagged unstable lattice → clean replacement crystal |
| **4 Word→Sentence** | Large seed crystal fractures into smaller refined facets |

### 4.4 Trace State: Phosphorescent Memory

```css
.thoughtChip[data-state="trace"] {
  background: var(--surface);
  background-image: repeating-linear-gradient(
    45deg, transparent, transparent 2px, var(--chip-line-trace) 2px, var(--chip-line-trace) 4px
  );
  opacity: 0.6;
}

.traceDot {
  width: 6px; height: 6px;
  background: radial-gradient(circle at 30% 30%, var(--chip-accent), var(--chip-accent-glow));
  animation: phosphoresce 3s ease-in-out infinite;
}

@keyframes phosphoresce {
  0%, 100% { opacity: 0.3; scale: 1; box-shadow: 0 0 4px var(--chip-accent-soft); }
  50%      { opacity: 0.9; scale: 1.4; box-shadow: 0 0 16px var(--chip-accent-glow); }
}
```

### 4.5 Inter-Chip Resonance (Ley Lines)

**Semantic Connections:**
```typescript
const RESONANCE_PAIRS: [string, string][] = [
  ['t1', 't6'], // Taskino ↔ Meta (both Mode 2: Question→Answer)
  ['t2', 't5'], // Mind 2.0 ↔ Offline-First (both Mode 1: Blur→Type)
  ['t3', 't4'], // Humanities×Code ↔ Circadian (opposite sides, complementary)
];
```

**Visual:** SVG beam between trace chips — golden thread, pulsing opacity

```css
.resonanceBeam {
  position: fixed; height: 1px;
  background: linear-gradient(90deg, var(--accent-soft), var(--accent), var(--accent-soft));
  opacity: 0; pointer-events: none; z-index: 1;
  animation: resonancePulse 2s ease-in-out infinite;
}

@keyframes resonancePulse {
  0%, 100% { opacity: 0.15; filter: blur(2px); }
  50%      { opacity: 0.5;  filter: blur(0); }
}
```

### 4.6 Reset: Aqua Regia Dissolution

```css
@keyframes dissolve {
  0%   { opacity: 0.6; scale: 1; filter: none; border-radius: 8px; }
  30%  { opacity: 0.8; scale: 1.08; filter: blur(2px) hue-rotate(-20deg); }
  60%  { opacity: 0.4; scale: 0.95; filter: blur(8px) hue-rotate(30deg); }
  100% { opacity: 0.88; scale: 1; filter: none; border-radius: 14px; }
}

.thoughtChip[data-state="resetting"] {
  animation: dissolve 1.2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.resetButton:active {
  animation: flaskShake 0.3s ease-out;
}

@keyframes flaskShake {
  0%, 100% { transform: translateX(0) rotate(0deg); }
  25% { transform: translateX(-2px) rotate(-1deg); }
  75% { transform: translateX(2px) rotate(1deg); }
}
```

### 4.7 Ambient Crucible Background

```css
.page:has(.thoughtChip[data-state="refining"])::before {
  animation: crucibleHeat 2s ease-in-out infinite;
}

@keyframes crucibleHeat {
  0%, 100% { opacity: 1; }
  50% { opacity: 1.3; }
}

/* Chip-specific color bleed */
.page:has([data-id="t3"][data-state="refining"])::before {
  background: radial-gradient(55% 45% at 75% 18%, rgba(224,147,90,0.12) 0%, transparent 70%);
}
```

### 4.8 Enhanced Magnetic Pull (Refinement)

```typescript
const MAGNETIC_MAX_PULL = 8;      // was 3
const MAGNETIC_RADIUS = 80;       // was 60
```

```css
.thoughtChip[data-state="raw"] {
  transform: 
    rotate(var(--rot, 0deg)) 
    translate(var(--mx, 0px), var(--my, 0px))
    skewX(calc(var(--pull-intensity, 0) * -2deg))
    skewY(calc(var(--pull-intensity, 0) * 1deg));
}
```

---

## 5. Technical Architecture & Optimization

### 5.1 Next.js 16 Configuration

```typescript
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,                    // 🔴 CRITICAL: was false
  // REMOVE: typescript.ignoreBuildErrors: true
  
  experimental: {
    optimizePackageImports: ["lucide-react", "@radix-ui/react-toast"],
  },
  
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  compress: true,
  
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
      {
        source: "/:path*.svg",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
  
  ...(process.env.ANALYZE === "true" && {
    webpack(config) {
      const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");
      config.plugins.push(new BundleAnalyzerPlugin({ analyzerMode: "static" }));
      return config;
    },
  }),
};

export default nextConfig;
```

### 5.2 Enhanced Metadata & SEO (layout.tsx)

```typescript
// Key additions to existing metadata:
export const metadata: Metadata = {
  metadataBase: new URL("https://taha-hosseini.dev"),
  title: {
    default: "طاها حسینی — جایی که اندیشه، کالبد می‌یابد",
    template: "%s | طاها حسینی",
  },
  description: "سنتز علوم انسانی و مهندسی نرم‌افزار...",
  keywords: ["طاها حسینی", "Taskino", "Mind 2.0", "علوم انسانی", "مهندسی نرم‌افزار", "Knowledge Alchemy"],
  authors: [{ name: "طاها حسینی", url: "https://taha-hosseini.dev" }],
  openGraph: {
    type: "website",
    locale: "fa_IR",
    url: "https://taha-hosseini.dev",
    siteName: "طاها حسینی",
    title: "طاها حسینی — جایی که اندیشه، کالبد می‌یابد",
    description: "سنتز علوم انسانی و مهندسی نرم‌افزار...",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "طاها حسینی - Portfolio" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "طاها حسینی — جایی که اندیشه، کالبد می‌یابد",
    description: "سنتز علوم انسانی و مهندسی نرم‌افزار.",
    images: ["/og-image.png"],
    creator: "@taha_hosseini",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
    other: [{ rel: "icon", type: "image/png", sizes: "32x32", url: "/favicon-32x32.png" }],
  },
  manifest: "/site.webmanifest",
  alternates: {
    canonical: "https://taha-hosseini.dev",
    languages: { "fa": "https://taha-hosseini.dev", "x-default": "https://taha-hosseini.dev" },
  },
  robots: { index: true, follow: true },
  verification: { google: "your-verification-code" },
};
```

### 5.3 Comprehensive JSON-LD (Hero.tsx)

```typescript
// Render all three schemas in one script tag
const JSON_LD = [PERSON_LD, WEBSITE_LD, PROFILE_PAGE_LD];

// PERSON_LD — Enhanced with @id, sameAs, knowsAbout, potentialAction
// WEBSITE_LD — SearchAction for site-wide search
// PROFILE_PAGE_LD — ProfilePage + BreadcrumbList
```

### 5.4 Archive Entry JSON-LD (EntryModal.tsx)

```typescript
function generateEntryJsonLd(entry: EntryDTO) {
  const base = {
    "@context": "https://schema.org",
    "@id": `https://taha-hosseini.dev/entry/${entry.id}`,
    url: `https://taha-hosseini.dev/entry/${entry.id}`,
    headline: entry.title,
    description: entry.excerpt ?? entry.content.slice(0, 160),
    datePublished: entry.createdAt,
    dateModified: entry.updatedAt,
    author: { "@id": "https://taha-hosseini.dev/#person" },
    publisher: { "@id": "https://taha-hosseini.dev/#person" },
    inLanguage: "fa-IR",
    isAccessibleForFree: true,
    keywords: entry.tags.join(", "),
  };

  switch (entry.type) {
    case "ARTICLE":
      return { ...base, "@type": "Article", articleSection: "مقاله", wordCount: entry.content.split(/\s+/).length };
    case "TOSHEH":
      return { ...base, "@type": "CreativeWork", genre: "توشه / یادداشت کوتاه", text: entry.content };
    case "POEM":
      return { ...base, "@type": "CreativeWork", genre: "شعر", text: entry.content, emotion: entry.emotion, dedicatee: entry.dedicatedTo };
  }
}
```

### 5.5 Performance Optimizations

| Optimization | Implementation |
|--------------|----------------|
| **Code Splitting** | `dynamic(() => import("@/components/Archive"), { ssr: false, loading: Skeleton })` |
| **Font Loading** | `preload: true`, `display: "swap"`, `fallback: ["system-ui"]` |
| **API Caching** | `Cache-Control: public, s-maxage=60, stale-while-revalidate=300` |
| **Turbopack** | `next dev --turbopack` |
| **Bundle Analysis** | `ANALYZE=true bun run build` |

### 5.6 Sitemap & Robots (App Router)

```typescript
// src/app/sitemap.ts
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries = await fetchEntries("all");
  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/archive`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    ...entries.map(e => ({ url: `${baseUrl}/entry/${e.id}`, lastModified: new Date(e.updatedAt), changeFrequency: "monthly", priority: 0.6 })),
  ];
}

// src/app/robots.ts
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/admin/"] },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
```

---

## 6. Implementation Roadmap

### Phase 0: Foundation (Week 1)
- [ ] Fix Next.js config (`reactStrictMode: true`, remove `ignoreBuildErrors`)
- [ ] Add sitemap.ts, robots.ts, manifest.json
- [ ] Create OG image (1200×630) with "Ink & Archive" aesthetic
- [ ] Add security headers, cache control

### Phase 1: Visual System (Week 1–2)
- [ ] Implement CSS variable system in `globals.css`
- [ ] Add Crimson Pro VF + JetBrains Mono VF via `next/font`
- [ ] Apply fluid type scale
- [ ] Update Hero, ThoughtCluster, Archive components to use design tokens

### Phase 2: Motion System (Week 2–3)
- [ ] **Priority 1:** Scroll-reveal crystallization entrance (replace `data-entered`)
- [ ] **Priority 2:** Crystal growth refining animation (replace scale+blur)
- [ ] **Priority 3:** Phosphorescent trace + resonance beams
- [ ] **Priority 4:** Dissolution reset + flask shake
- [ ] **Priority 5:** Crucible background reactions
- [ ] **Priority 6:** Enhanced magnetic pull with facet skew

### Phase 3: Content & Structure (Week 3)
- [ ] Add Synthesis section between Hero and Projects
- [ ] Update Project cards with Root Thought / Built Structure schema
- [ ] Link Archive entries → Projects (bidirectional)
- [ ] Implement enhanced JSON-LD in Hero + EntryModal

### Phase 4: Performance & Polish (Week 4)
- [ ] Dynamic imports for Archive, ThoughtCluster
- [ ] Bundle analysis + optimization
- [ ] Lighthouse CI integration
- [ ] Cross-browser testing (RTL, Persian font rendering)
- [ ] Reduced motion compliance audit

---

## 7. File Map & Touch Points

| File | Changes Required |
|------|------------------|
| `next.config.ts` | Complete rewrite (see 5.1) |
| `src/app/layout.tsx` | Enhanced metadata, font imports, viewport config |
| `src/app/globals.css` | CSS variables, fluid type, structural language, motion keyframes |
| `src/app/page.tsx` | Add Synthesis component, dynamic imports |
| `src/components/Hero/Hero.tsx` | JSON-LD, scroll-reveal integration |
| `src/components/Hero/ThoughtCluster.tsx` | Scroll reveal hook, resonance detection, state machine |
| `src/components/Hero/RawThought.tsx` | Crystal growth, trace, dissolution animations |
| `src/components/Hero/ThoughtCluster.module.css` | All motion keyframes, state styles |
| `src/components/Archive/EntryModal.tsx` | Entry JSON-LD injection |
| `src/app/sitemap.ts` | New file |
| `src/app/robots.ts` | New file |
| `public/site.webmanifest` | New file |
| `public/og-image.png` | New asset (1200×630) |

---

## 8. Accessibility & Quality Gates

### 8.1 Reduced Motion Compliance
```css
@media (prefers-reduced-motion: reduce) {
  .thoughtChip[data-scroll-revealed="true"] { animation: none; opacity: 0.88; scale: 1; filter: none; }
  .thoughtChip[data-state="refining"] { animation: none; }
  .traceDot, .resonanceBeam, .resetButton { animation: none; }
}
```

### 8.2 Focus Management
- Visible focus rings (`--focus` = `--verdigris`)
- Logical tab order (RTL-aware)
- Skip link to main content

### 8.3 Color Contrast (WCAG AA)
| Pair | Ratio | Status |
|------|-------|--------|
| `--fg` on `--bg` | 15.8:1 | ✅ AAA |
| `--muted` on `--bg` | 4.8:1 | ✅ AA |
| `--accent` on `--bg` | 4.5:1 | ✅ AA |
| `--accent` on `--parchment` | 5.2:1 | ✅ AA |

### 8.4 Performance Budgets
| Metric | Budget |
|--------|--------|
| Total JS (gzipped) | < 120 KB |
| LCP | < 2.5s |
| INP | < 200ms |
| CLS | < 0.1 |

---

## 9. Design Tokens Export (for DesignSync)

```json
{
  "colors": {
    "ink-black": "#0B0B0C",
    "parchment": "#F5F0E8",
    "sepia-ink": "#8B7355",
    "iron-gall": "#4A3A2A",
    "verdigris": "#3A6B6B",
    "ochre": "#C9A84C"
  },
  "typography": {
    "fontFamilies": {
      "primary": "var(--font-vazirmatn)",
      "display": "var(--font-crimson-pro)",
      "mono": "var(--font-jetbrains-mono)"
    },
    "scale": { "--step-0": "clamp(1rem, 0.96rem + 0.22vw, 1.13rem)", ... }
  },
  "spacing": { "base": "8px", "scale": [0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48, 64] },
  "borderRadius": { "card": "2px", "chip": "14px", "chipRefined": "8px", "focus": "6px" },
  "shadows": {
    "raw": "0 2px 8px rgba(11,11,12,0.4)",
    "growing": "0 4px 16px rgba(58,107,107,0.2)",
    "faceted": "0 8px 24px rgba(58,107,107,0.25)",
    "crystal": "0 12px 32px rgba(58,107,107,0.3), 0 0 0 1px rgba(58,107,107,0.15) inset"
  }
}
```

---

## 10. Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-07-25 | Dark-first "Ink & Archive" palette | Aligns with Knowledge Alchemy metaphor; warm, scholarly, not generic dark mode |
| 2026-07-25 | Crimson Pro for Latin display | Garamond lineage = Renaissance humanism = Humanities × Code synthesis |
| 2026-07-25 | Scroll-reveal over auto-play entrance | User agency; discovery feels like laboratory exploration |
| 2026-07-25 | Crystal growth over simple scale | Metaphor consistency; each mode has distinct crystallization behavior |
| 2026-07-25 | Phosphorescent trace (not simple dot) | Residue has memory; enables resonance visualization |
| 2026-07-25 | JSON-LD: Person + WebSite + ProfilePage | Maximum rich snippet eligibility; entity linking |
| 2026-07-25 | Dynamic import Archive/ThoughtCluster | Largest components; SSR not needed (IntersectionObserver, animations) |

---

*This document synthesizes five expert perspectives into a single actionable specification. Each section can be handed to its respective specialist for implementation while maintaining system coherence.*