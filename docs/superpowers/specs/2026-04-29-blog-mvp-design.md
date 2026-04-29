# Blog MVP — Design Spec

**Date**: 2026-04-29
**Project**: Platinum Construction Corporation website (static prototype)
**Phase**: 4 — Blog MVP
**Estimated effort**: ~1h30

## Goal

Add a content/blog section to the static site to support SEO and lead generation, starting with one inaugural article. The system must scale cleanly to N future articles without rework.

## Non-goals (YAGNI)

- No CMS, no build step, no JS data layer (articles are hand-authored static HTML)
- No comments, social share buttons, author bylines, dark mode, or auto-generated table of contents
- No category filter on the blog index (added later when there are 4+ articles)
- No related-articles widget (added later)
- No WordPress portability concerns at this stage — the static structure is the deliverable

## Architecture

### File layout

```
blog.html                                                ← magazine-style index
blog/
  building-out-commercial-space-ontario.html             ← inaugural article
assets/css/main.css                                      ← + ~150 lines (blog index + article reader)
sitemap.xml                                              ← + 2 URLs
```

No new JS files. No new data file. The blog index lists articles in inline HTML; when the catalog reaches ~5 articles, this can be extracted to a `blog-data.js` module (not now).

### Sidebar nav

Add `Blog` entry to the sidebar nav across the 7 main pages (`index`, `about`, `services`, `gallery`, `virtual-tours`, `environmental-policy`, `contact`) plus `quote.html` if it carries the sidebar, positioned between `Gallery` and `Virtual Tours`. Same treatment in the mobile overlay menu (`assets/js/layout.js` injects nothing extra here — the link lives in each HTML's static nav).

### URL strategy

Vercel `vercel.json` already enables clean URLs. Resulting public URLs:
- `/blog` → `blog.html`
- `/blog/building-out-commercial-space-ontario` → `blog/building-out-commercial-space-ontario.html`

## blog.html — magazine index

### Structure

1. Sidebar (existing, unchanged except for new nav entry)
2. Page-hero: compact band on `--color-light-alt` ivory background, containing:
   - H1 "Insights"
   - Sub-line: one sentence ("Construction guides, project stories, and practical knowledge from 27 years of commercial build-outs.")
3. Cards grid: 3 cols desktop, 2 cols tablet, 1 col mobile

### Card anatomy

```
[ cover image — 16:9 ratio, object-fit: cover ]
CATEGORY · 7 MIN READ              ← micro-meta, Oswald uppercase, accent gold
Article title                      ← Oswald, large, dark
One-line excerpt (Inter, muted)
April 29, 2026                     ← date, small, muted
```

Hover: subtle lift (translate-y -2px) + image zoom 1.04, mirroring the gallery card behavior.

### Cover image for article 1

Pull a "construction in progress" photo from `projects/New Plaza Development - 171 George Reynolds Dr. Courtice, ON/` (59 photos available — pick a wide chantier shot). Path stored as `cover` attribute in the card markup. Filename containing `#` must be URL-encoded as `%23` per the existing project convention.

## blog/<slug>.html — article reader

### Structure

1. Sidebar (existing)
2. Article wrapper: `max-width: 720px`, centered horizontally within the body content area (which already has `padding-left: 280px` for the sidebar)
3. Breadcrumb: `Blog › Build-Out Guide` (small, muted, uppercase)
4. H1 article title (Oswald, ~48px desktop / 36px mobile)
5. Lead/dek: one-sentence subtitle (Inter 20px, muted)
6. Meta-line: `April 29, 2026 · 7 min read · [BUILD-OUT GUIDE badge]`
7. Cover image (full 720px, 16:9) — same image as the index card
8. Article body
9. CTA card: ivory background, gold border-left accent, copy "Planning a build-out? Platinum has delivered 500+ commercial projects since 1997.", button "Get a free quote →" linking to `/quote`
10. Footer (existing dark footer)

### Body typography

- Paragraphs: Inter 18px, line-height 1.7, color `--color-text-dark`, margin-bottom 1.25em
- H2: Oswald uppercase, 28px, margin-top 2.5em, margin-bottom 0.6em
- H3: Oswald, 20px, margin-top 1.8em
- Lists: bullets in `--color-accent` gold (custom `::marker` or pseudo-element), 1.5em padding-left
- Blockquote: 3px left border in accent gold, italic, padding-left 1.25em, color muted
- Internal links: underlined, color shifts to `--color-accent` on hover

### SEO/meta

Each article HTML includes:
- `<title>`, `<meta name="description">`
- Open Graph tags (`og:title`, `og:description`, `og:image`, `og:type=article`, `og:url`)
- Twitter card tags
- Canonical URL
- JSON-LD `Article` schema with `headline`, `datePublished`, `author: { @type: Organization, name: Platinum Construction Corporation }`, `image`, `publisher`

`blog.html` (index) gets a standard `Blog` JSON-LD schema or just `WebPage`.

Both new URLs added to `sitemap.xml`.

## Article 1 — editorial plan

**Title**: *What to Expect When Building Out a Commercial Space in Ontario*
**Slug**: `building-out-commercial-space-ontario`
**Lead**: "From signing the lease to opening the doors — a practical timeline for tenants, franchisees, and first-time operators."
**Category**: Build-Out Guide
**Reading time**: 7 min
**Publish date**: 2026-04-29
**Word target**: 1200-1500 words

### Section outline

| # | Section | Words |
|---|---|---|
| 1 | Introduction — who this is for, why it matters | ~100 |
| 2 | Step 1 — Lease & landlord coordination | ~150 |
| 3 | Step 2 — Design & permit drawings | ~180 |
| 4 | Step 3 — Permits & approvals | ~200 |
| 5 | Step 4 — Construction phase | ~200 |
| 6 | Step 5 — Inspections & occupancy | ~150 |
| 7 | Realistic timeline (table: small retail / restaurant / multi-unit) | ~150 |
| 8 | Common pitfalls & how to avoid them | ~150 |
| 9 | CTA card | (template, not counted) |

**Tone**: practical, factual, non-promotional in the body. Promotion lives in the CTA. Examples ground in restaurant/coffee/retail (matches portfolio). Generic figures flagged as such; jurisdiction-dependent details (permit fees, inspection turnaround) phrased as ranges, not absolutes.

**Sources**: general industry knowledge of Ontario commercial construction. No specific client data referenced. Hasan can review pre-publish if desired (optional gate).

## CSS scope

Estimated +150 lines in `assets/css/main.css`, organized as a new section:

```css
/* ============================================================
   BLOG — index magazine + article reader
   ============================================================ */

/* Page hero (shared with other page heroes — reuse if class exists) */
.blog-hero { ... }

/* Index grid + cards */
.blog-grid { ... }
.blog-card { ... }
.blog-card__cover { ... }
.blog-card__meta { ... }
.blog-card__title { ... }
.blog-card__excerpt { ... }
.blog-card__date { ... }

/* Article reader */
.article { max-width: 720px; margin: 0 auto; padding: ... }
.article__breadcrumb { ... }
.article__title { ... }
.article__lead { ... }
.article__meta { ... }
.article__cover { ... }
.article__body p { ... }
.article__body h2 { ... }
.article__body h3 { ... }
.article__body ul, .article__body ol { ... }
.article__body blockquote { ... }
.article__body a { ... }

/* CTA card at end of article */
.article-cta { ... }
.article-cta__title { ... }
.article-cta__btn { ... }

/* Responsive */
@media (max-width: 1024px) { ... }
@media (max-width: 768px) { ... }
```

No inline styles introduced (keeps Phase 1 SEO debt unchanged).

## Cache-busting

Bump `main.css?v=5` → `main.css?v=6` across the existing HTML files (7 main pages + `quote.html` if applicable). The 2 new files (`blog.html`, article page) use `?v=6` from creation.

## Verification

1. Run `npx live-server --port=5500` locally
2. Open `/blog.html` — verify card renders, hover works, link to article works
3. Open `/blog/building-out-commercial-space-ontario.html` — verify reader layout, typography, CTA card, links to `/quote.html`
4. Click sidebar `Blog` link from each existing page — confirm it navigates correctly
5. Mobile (DevTools 375px): sidebar collapses, blog index single-column, article reader fills width with comfortable padding
6. View page source — confirm meta tags, JSON-LD, canonical URL present
7. Validate `sitemap.xml` includes both new URLs

## Out of scope for this spec

- Article 2+ (separate writing tasks)
- Categorical filtering on the index
- Newsletter signup, RSS feed
- WordPress portability (revisit when the site is ported)
- Phase 1 SEO deferred item (move inline styles to CSS) — independent track

## Acceptance criteria

- `blog.html` and `blog/building-out-commercial-space-ontario.html` exist, render correctly, pass HTML validation
- Sidebar `Blog` nav entry present and functional on all existing pages that carry the sidebar, plus the 2 new blog pages
- Article 1 hits 1200-1500 words, follows the section outline, ends with the CTA card
- All 8 SEO meta concerns covered (title, description, OG, Twitter, canonical, JSON-LD, sitemap entry, internal link from sidebar)
- No regression on existing pages (visual + nav + lighthouse equivalent)
- Single commit (or small grouped commits) on `main` with clear message
