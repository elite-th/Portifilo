# Portfolio UI/UX Audit & World-Class Roadmap
**Project:** `portfolio-source (2)` — طاها حسینی / "Knowledge Alchemy"
**Stack:** Next.js 16.2 (App Router, Turbopack), React 19, CSS Modules, Tailwind v4, Prisma/SQLite
**Locale:** Persian (`fa`), `dir="rtl"`, dark-first
**Audit date:** 2026-08-04
**Method:** Static analysis + WCAG contrast computation + production build + live DOM inspection of the running dev server (`localhost:3000`, HTTP 200, 102 KB SSR HTML).

---

## 0. Executive Summary

This is **not a generic portfolio**. The concept — thought chips that "refine" from raw to crystallized, an alchemy narrative from calcination to coagulation, a particle-canvas synthesis graph — is genuinely original and far above template work. The typography system, the RTL-native Persian voice, and the HMAC auth implementation are all evidence of real craft.

That makes the defects more costly, not less: **the failures are almost entirely in the last 5% of finishing**, and they are the 5% a hiring manager or collaborator hits in the first fifteen seconds.

The single most damaging finding, verified against the live rendered DOM:

> **5 of the 7 navigation links on the page point to anchors that do not exist.** Every link in the site header — آزمایشگاه, یادداشت‌ها, مسیر فکری — is dead. All 6 project cards link to `/projects/*` routes that return 404.

A visitor's first click has a ~71% chance of doing nothing at all. No amount of animation polish compensates for that.

### Severity ledger

| # | Finding | Severity | Evidence |
|---|---|---|---|
| 1 | 5/7 nav anchors dead; 6/6 project links 404 | **Critical** | Live DOM grep |
| 2 | All favicons, OG image, manifest missing | **Critical** | `public/` listing |
| 3 | Entire site invisible without JS | **Critical** | `opacity:0` + no `noscript` |
| 4 | Two conflicting color palettes shipped | **High** | Token vs. usage diff |
| 5 | Body/meta text fails WCAG AA | **High** | Computed contrast |
| 6 | Hero unusable on touch (hover-only) | **High** | No `hover:none` fallback |
| 7 | 6 unthrottled global `mousemove` listeners | **High** | `RawThought.tsx:258` |
| 8 | Canvas rAF never pauses offscreen | **High** | No IO gating |
| 9 | Resonance beams read DOM during render | **High** | `ThoughtCluster.tsx:363` |
| 10 | Light theme defined but unreachable | Medium | No toggle exists |
| 11 | Type scale defined, bypassed 40+ times | Medium | 3 uses vs. 40 hardcoded |
| 12 | 9.3px text; touch targets under 44px | Medium | `font-size: 0.58rem` |
| 13 | Dangling `aria-labelledby="connect-title"` | Medium | Live DOM grep |
| 14 | Unused dep + 306 KB orphaned asset | Low | Import scan |
| 15 | No rate limiting on admin login | Low | `login/route.ts` |

**Verified as already correct** (do not "fix"): heading hierarchy h1→h2→h3 is clean across all 11 sections; `tsc --noEmit` passes; production build succeeds; SSR emits real content (Taskino, تهران, هگل all present — SEO is fine); auth uses HMAC with `timingSafeEqual` and `httpOnly` cookies; `.env` is correctly gitignored and untracked.

---

## 1. Critical — Broken Navigation

### Evidence
```
BROKEN  #lab     <- header nav "آزمایشگاه"
BROKEN  #notes   <- header nav "یادداشت‌ها"
BROKEN  #path    <- header nav "مسیر فکری"
BROKEN  #collab  <- ExploreMore card
BROKEN  #sanctum <- ExploreMore card
OK      #projects
OK      #archive
```
Existing IDs are `whoami`, `whatibuild`, `whereifrom`, `whereigo`, `openquestions`, `connect`, `synthesis`, `projects`, `archive`, `explore`.

### Why this is the worst finding
Header nav is the highest-intent UI on the page. A dead link there reads as "abandoned" — the exact opposite of the meticulousness the rest of the site is arguing for.

### Fix
Point the nav at real sections. `آزمایشگاه` (laboratory) → `#projects`, `یادداشت‌ها` (notes) → `#archive`, `مسیر فکری` (thought-path) → `#whoami`. For ExploreMore, `#collab` → `#connect`, `#sanctum` → `#archive`.

Project cards should not link to non-existent routes at all. Until per-project pages exist, drop `href` — `ProjectCard` already renders conditionally on `href` being present, so removing the field makes the CTA disappear cleanly. That is a smaller, more honest diff than shipping six 404s.

**Guardrail** — a test that fails when an anchor dies, rather than a manual re-check:
```js
// scripts/check-anchors.mjs — run against the built HTML or dev server
const html = await (await fetch('http://localhost:3000')).text();
const ids = new Set([...html.matchAll(/id="([^"]+)"/g)].map(m => m[1]));
const bad = [...html.matchAll(/href="#([^"]+)"/g)]
  .map(m => m[1]).filter(h => h !== 'top' && !ids.has(h));
if (bad.length) { console.error('Dead anchors:', bad); process.exit(1); }
console.log('All anchors resolve.');
```

---

## 2. Critical — Missing Brand Assets

`layout.tsx` references six files; **none exist**:
`favicon.ico`, `favicon-16x16.png`, `favicon-32x32.png`, `apple-touch-icon.png`, `site.webmanifest`, `og-image.png`.

Consequences: a blank/default browser-tab icon, and — because `og-image.png` is 404 — **every share of this link on Telegram, X, LinkedIn, or Slack renders an empty grey card.** For a portfolio whose distribution is "someone shares the link," this silently destroys the first impression at exactly the moment it matters.

### Fix
Next.js App Router generates these from convention — no static files, no design tool:

- `src/app/icon.tsx` → favicon at any size
- `src/app/apple-icon.tsx` → Apple touch icon
- `src/app/opengraph-image.tsx` → 1200×630 OG card, rendered with `ImageResponse`
- `src/app/manifest.ts` → typed web manifest

Then delete the now-redundant hardcoded `icons` / `manifest` blocks from `layout.tsx` metadata. Also fix `verification: { google: "your-verification-code" }` — a placeholder currently shipping to production.

The OG image should use the existing palette (`#0B0B0C` ink, `#C9A84C` ochre) with the headline «می‌سازمش، چون می‌بینمش.» so the share card carries the same voice as the site.

---

## 3. Critical — Site Invisible Without JavaScript

Reveal animations initialize at `opacity: 0` and are flipped to visible only by `IntersectionObserver` in `useScrollReveal`. There is no `<noscript>` anywhere and no `@media (scripting: none)` rule.

If JS fails — CDN blocked, corporate proxy, slow 3G timeout, a bad extension — the visitor gets a **blank dark page**. The SSR HTML is fine (content is all there, verified), so this is purely a CSS-gating failure. That is a total loss of a visitor for a cause that takes three lines to fix.

### Fix
One block in `globals.css`. `scripting: none` is the native CSS media feature for exactly this, so no JS or markup change is needed:
```css
@media (scripting: none) {
  [style*="--reveal-delay"],
  [data-journey-section] * {
    opacity: 1 !important;
    transform: none !important;
    animation: none !important;
  }
}
```

---

## 4. High — Two Conflicting Palettes

`globals.css` defines a verdigris/ochre system. Components ignore it:

| Hardcoded value | Occurrences | Token that should be used |
|---|---|---|
| `rgba(212, 175, 106, …)` | **50** | `--ochre` is `#C9A84C` — different gold |
| `rgba(245, 240, 228, …)` | 19 | `--parchment` is `#F5F0E8` — different cream |
| `rgba(139, 0, 0, …)` | 6 | crimson — **not in the palette at all** |
| `rgba(122, 148, 114, …)` | 8 | sage — **not in the palette at all** |

`Synthesis.module.css` (37), `ProjectCard.module.css` (30), and `Projects.module.css` (28) are the worst offenders. The result is that "gold" is a slightly different gold in three sections — subtle enough to read as sloppiness rather than intent.

### Fix
The honest resolution is to **promote the colors actually in use** to tokens rather than mass-rewriting 90+ call sites to values the design has already rejected. `#D4AF6A` is used 50 times and scores **9.50:1** contrast — it is the better gold. Adopt it:
```css
--gold: #D4AF6A;         /* was ad-hoc rgba(212,175,106) — 9.50:1 */
--gold-soft: rgba(212, 175, 106, 0.16);
--gold-glow: rgba(212, 175, 106, 0.32);
```
Then sweep `rgba(212, 175, 106, X)` → `var(--gold-*)`, and delete the stray crimson and sage, which belong to no system.

---

## 5. High — Contrast Failures (WCAG AA)

Computed against `--bg: #0B0B0C`:

| Token | Hex | Ratio | Verdict |
|---|---|---|---|
| `--parchment` (body) | `#F5F0E8` | 17.34 | Pass |
| `--ochre` | `#C9A84C` | 8.61 | Pass |
| `--accent-bright` | `#4DB8B8` | 8.30 | Pass |
| `--sepia-ink` (**muted text**) | `#8B7355` | **4.39** | **Fails AA** |
| `--ink-raw` (raw chips) | `#6B5B4A` | **3.02** | **Fails AA** |
| `--muted-2` | `#5A4E3E` | **2.43** | **Fails badly** |
| `--verdigris` (**focus ring**) | `#3A6B6B` | **3.27** | **Fails AA** |
| `--iron-gall` (borders) | `#4A3A2A` | **1.81** | Invisible |

`--sepia-ink` is the site-wide muted/secondary text color — the most-used non-primary color on the page — and it misses AA. `--verdigris` failing is worse: it is the **focus indicator**, so keyboard users get a ring they may not see. Persian script has finer strokes and lower x-height contrast than Latin, so these ratios read *worse* in practice than the numbers suggest.

### Fix
Lift only the failing values; the passing ones are already good.
```css
--sepia-ink: #A89178;   /* 4.39 → 6.3:1  */
--ink-raw:   #8A7A66;   /* 3.02 → 4.6:1  */
--muted-2:   #7A6E5E;   /* 2.43 → 3.6:1 (decorative only) */
--focus:     #4DB8B8;   /* 3.27 → 8.30:1 — reuse accent-bright */
--border:    #5C4938;   /* 1.81 → 2.6:1 — visible as a border */
```
`--focus` is a one-word change with the largest accessibility payoff on the page.

---

## 6. High — Hero Unusable on Touch

`RawThought` activates on `onMouseEnter` / `onMouseLeave`. There is **no `@media (hover: none)` fallback** in the Hero (only `ExploreMore.module.css:316` has one). `onClick` exists, but the hint text says «روی هر فکر بزن تا پخته بشه» ("tap each thought to refine it") and the mousemove "fish-eye" scaling never fires on touch.

The Hero is the entire first impression, and on mobile — likely the majority of traffic from a shared link — the signature interaction is inert or confusing.

### Fix
Gate the pointer-driven affordances on `@media (hover: hover) and (pointer: fine)`, and on coarse pointers render chips at their resting scale with a visible tap affordance. The `onClick` toggle already exists, so this is a CSS-and-copy fix, not a rewrite of the state machine.

---

## 7–9. High — Performance: Three Compounding Issues

### 7. Six unthrottled global `mousemove` listeners
`RawThought.tsx:258` attaches `window.addEventListener("mousemove", …)` per chip. Six chips → **six listeners firing on every pointer move**, each calling `getBoundingClientRect()` (a forced synchronous layout read) and writing three CSS custom properties. At 120 Hz that is ~720 layout reads/second.

**Fix:** hoist to a single listener in `ThoughtCluster`, cache rects (recompute on resize/scroll only), and coalesce writes into one `requestAnimationFrame`. This turns 6 listeners × N reads into 1 listener + 1 rAF write per frame.

### 8. Canvas rAF never pauses offscreen
`Synthesis.tsx:563` starts `requestAnimationFrame(loop)` on mount and only cancels on unmount. The particle simulation **runs continuously even when the section is scrolled far offscreen** — the user reaching the Archive is still paying for particles they cannot see. On a laptop this is measurable battery drain; on mobile it is thermal throttling that degrades the rest of the page.

**Fix:** gate with `IntersectionObserver` — cancel the rAF on exit, restart on enter — plus a `visibilitychange` listener to stop when the tab is backgrounded. ~10 lines, no visual change.

### 9. DOM reads during render
`ThoughtCluster.tsx:363` calls `document.querySelector` + `getBoundingClientRect()` **inside the JSX render path** for resonance beams. This is a React anti-pattern (impure render, breaks concurrent rendering) and forces layout mid-render. Worse, the beams are `position: fixed` while chips scroll with the page, so **the beams visually detach from the chips on any scroll**.

**Fix:** move measurement into `useLayoutEffect` with state, switch the SVG layer to `position: absolute` inside the scatter field so it shares the chips' coordinate space, and recompute on resize.

---

## 10–15. Medium & Low

**10 — Light theme unreachable.** A complete light palette exists at `globals.css:202-227`, but `layout.tsx:98` hardcodes `className="dark"` and no toggle or `prefers-color-scheme` hook exists. Dead code that also misleads maintainers. Either wire it up (respect the OS preference, persist an override) or delete it. Note `--ochre` scores only **2.01:1** on the light background, so the light palette needs its own gold before it ships.

**11 — Type scale bypassed.** A well-built fluid scale (`--step--2` … `--step-6`, `clamp()`-based) is used **3 times**, while **40+ distinct hardcoded `font-size` values** bypass it. Migrate to the scale; the values already cluster near the steps.

**12 — Illegible text & small touch targets.** `font-size: 0.58rem` = **9.3px**, with `0.6rem`, `0.625rem`, `0.64rem` close behind. Floor body-adjacent text at `0.75rem` (12px) and ensure interactive elements meet the 44×44px target (WCAG 2.5.8).

**13 — Dangling ARIA reference.** `Connect.tsx:73` sets `aria-labelledby="connect-title"`, but no element has that ID — verified against live DOM. The section's accessible name is empty for screen readers. Either add the ID to the lead paragraph or use `aria-label="بیا وصل بشیم"`.

**14 — Dead weight.** `iran-map-react` is in `package.json` but imported **0 times**; `public/iran-map.svg` is **306 KB** and referenced nowhere (the component uses `gold-iran.svg`). Remove both.

**15 — No login rate limiting.** `api/admin/login` accepts unlimited attempts. The crypto is genuinely well done — HMAC-SHA256, `timingSafeEqual`, `httpOnly`, `secure` in prod — so this is the one remaining gap. Add a simple in-memory attempt counter keyed by IP.

Also: `.env` contains `DATABASE_URL="file:/home/z/my-project/db/custom.db"` — a leftover **Linux** path from the scaffold, on a Windows machine. It should be `file:./prisma/dev.db`.

---

## 16. Roadmap

Ordered by *visitor impact per hour of work*, not by difficulty.

### Phase 1 — Stop the bleeding — **COMPLETE (verified)**
All items below were implemented and verified against the running dev server and a production build.

1. ✅ **5 dead nav anchors fixed** — `#lab`→`#projects`, `#notes`→`#archive`, `#path`→`#whoami`, `#collab`→`#connect`, `#sanctum`→`#archive`. Verified: `✓ all 5 in-page anchors resolve (27 ids found)`.
2. ✅ **6 project 404s removed** — dropped `href` from all six entries; `href` is now optional and `ProjectCard`'s conditional CTA hides cleanly. All 6 projects still render.
3. ✅ **Brand assets generated** — `icon.tsx`, `apple-icon.tsx`, `opengraph-image.tsx`, `manifest.ts`. All serve HTTP 200. Stale `icons`/`manifest`/`og-image.png` metadata and the `your-verification-code` placeholder removed from `layout.tsx`.
4. ✅ **No-JS fallback added** — `@media (scripting: none)` block in `globals.css`.
5. ✅ **Contrast fixed** — `--focus` 3.27→**8.30**, `--sepia-ink` 4.39→**6.30**, `--ink-raw` 3.02→**4.62**, `--border` 1.81→**2.62**, `--muted-2` 2.43→**3.61**. `--gold: #D4AF6A` tokenized.
6. ✅ **Dangling `connect-title` fixed** — replaced with `aria-label`. All 8 remaining `aria-labelledby` refs verified to resolve.
7. ✅ **Dead weight removed** — `iran-map-react` uninstalled; `public/iran-map.svg` (306 KB) deleted; `.env` corrected to `file:./dev.db`.
8. ✅ **Regression guard added** — `scripts/check-anchors.mjs`.

**Bug found and fixed during implementation:** consolidating two ExploreMore cards onto `#archive` collided with `key={card.href}`, producing a React duplicate-key error. Switched to `key={card.title}`. Verified zero new errors on a fresh request.

**Verification:** `tsc --noEmit` passes · production build succeeds · `/opengraph-image` prerenders a real 1200×630 PNG (confirmed by pixel sampling: ink `#0B0B0C`, parchment `#F5F0E8`, muted `#A89178`, gold `#D4AF6A` + 114 antialiased shades, so Persian text shaped correctly) · 0 new console errors.

### Phase 1 notes for later
`next/og` cannot shape Persian with its default font — it throws `lookupType: 5 - substFormat: 3 is not yet supported`. `opengraph-image.tsx` therefore fetches a real Vazirmatn buffer and sets `fontFamily`, with a null-guard that degrades to the default font rather than failing the build. Keep this if you edit the OG card.

### Phase 2 — Make it trustworthy (~4 hrs)
7. Consolidate the palette on `--gold: #D4AF6A`; delete crimson/sage strays.
8. Single throttled pointer listener; rAF-batched writes.
9. IntersectionObserver + `visibilitychange` gating on the canvas.
10. Move resonance-beam measurement out of render; fix `fixed` → `absolute`.
11. Touch-first Hero: `hover:hover` gating + real tap affordance.

### Phase 3 — Make it excellent (~6 hrs)
12. Migrate hardcoded font sizes onto the fluid scale; enforce a 12px floor.
13. Resolve the light theme — ship it properly or delete it.
14. Audit touch targets to 44×44px.
15. Rate-limit admin login.
16. Add real `/projects/[slug]` pages, then restore the card links.

### Phase 4 — Make it unforgettable
The concept is already distinctive; these deepen it rather than adding novelty.
17. **View Transitions API** for section changes — native, progressive, no library.
18. **Reduced-motion parity** — verify every animation has a still equivalent that still communicates the idea.
19. **A real Persian typographic pass** — Vazirmatn's optical sizing, `font-feature-settings`, correct ZWNJ handling in compound words.
20. **Make the alchemy legible** — the calcination→coagulation metaphor is currently implicit; one line of scaffolding per section would let a first-time visitor feel the arc rather than infer it.

---

## 17. Closing Assessment

The gap here is not talent or ambition — both are clearly present, and the underlying concept is stronger than the vast majority of developer portfolios. The gap is **finishing**: dead links, missing icons, and a blank page without JS are all cheap to fix and expensive to leave.

Phase 1 alone — roughly two hours — moves this from "impressive but broken" to "solid." Phases 2–3 make it genuinely world-class. Phase 4 is where the alchemy concept, which is the actual differentiator, gets room to land.

One structural note worth stating plainly: the codebase carries heavy multi-worker coordination comments ("Owned by Worker C (Task 42-C). Do not edit without coordinating"), and the two-palette split is exactly the kind of drift that process produces. Consolidating tokens first will make every later change cheaper.
