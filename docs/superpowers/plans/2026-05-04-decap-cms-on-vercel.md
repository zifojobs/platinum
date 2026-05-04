# Decap CMS on Vercel + Eleventy — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the static Platinum site to an Eleventy build with Decap CMS at `/admin`, so the client's SEO team can publish blog articles and edit per-page SEO meta in autonomy.

**Architecture:** Eleventy 3.x compiles markdown articles, JSON-driven SEO meta, and existing static HTML (passthrough) into a single `_site/` directory served by Vercel. Decap CMS at `/admin` writes commits via GitHub OAuth (proxy on Vercel functions) using Editorial Workflow (drafts → publish merges PR).

**Tech Stack:** Eleventy 3, Nunjucks, markdown-it, Decap CMS (CDN), Node 20 Vercel serverless functions, GitHub OAuth.

**Spec:** [docs/superpowers/specs/2026-05-04-decap-cms-on-vercel-design.md](../specs/2026-05-04-decap-cms-on-vercel-design.md)

**Note on TDD:** This is a static-site migration with no test runner. "Tests" here are: (a) `npm run build` succeeds without warnings, (b) visual parity checks against the current production site, (c) HTTP smoke tests on Vercel preview URLs. Each task ends with explicit verification before the commit.

**Note on out-of-band steps:** The plan flags steps marked `[OOB]` that the user (Saïbo) must perform manually outside the assistant's tool access — Vercel env vars, GitHub OAuth App settings, branch protection, collaborator invites.

---

## Phases

| # | Phase | Tasks |
|---|---|---|
| 1 | Eleventy infrastructure (passthrough only, no behavioral change) | T1–T5 |
| 2 | Templating + content migration | T6–T11 |
| 3 | Decap admin + OAuth | T12–T14 |
| 4 | Verification + documentation | T15–T17 |

The plan is structured so that **after each phase** the site still works on prod (or could be safely pushed). This bounds risk: if we stop at the end of phase 1, the site is just running through Eleventy passthrough — no user-facing change. If we stop after phase 2, the SEO team doesn't have the admin yet but the site is fully migrated.

---

## Phase 1 — Eleventy infrastructure

### Task 1: Initialize npm package + install Eleventy

**Files:**
- Create: `package.json`
- Create: `package-lock.json` (auto-generated)

**Why:** The project currently has no Node tooling. We add the absolute minimum to run Eleventy.

- [ ] **Step 1: Create `package.json`**

Create the file at the project root with this exact content:

```json
{
  "name": "platinum-construction-site",
  "version": "1.0.0",
  "private": true,
  "description": "Platinum Construction Corporation static site, built with Eleventy.",
  "scripts": {
    "start": "eleventy --serve --port=8080",
    "build": "eleventy",
    "clean": "rimraf _site"
  },
  "devDependencies": {
    "@11ty/eleventy": "^3.0.0",
    "markdown-it": "^14.0.0",
    "rimraf": "^5.0.0"
  }
}
```

- [ ] **Step 2: Install dependencies**

Run from the project root:

```bash
npm install
```

Expected: creates `node_modules/` and `package-lock.json`. No errors. Eleventy 3.x and markdown-it installed.

- [ ] **Step 3: Verify Eleventy is callable**

Run:

```bash
npx @11ty/eleventy --version
```

Expected output: `3.x.y` (some 3.x version).

- [ ] **Step 4: Update .gitignore**

Open `.gitignore` and append at the end:

```
# Node / Eleventy
node_modules/
_site/
```

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json .gitignore
git commit -m "Add Eleventy 3 + npm scaffolding for static site build"
```

---

### Task 2: Create `.eleventy.js` with passthrough config (zero-change build)

**Files:**
- Create: `.eleventy.js`

**Why:** This first config does nothing but copy every existing file from the project root to `_site/` unchanged. Goal: prove the build pipeline works without changing the site's behavior.

- [ ] **Step 1: Create `.eleventy.js`**

Create at the project root with this exact content:

```js
module.exports = function (eleventyConfig) {
  // Passthrough copy: every existing static asset is mirrored to _site/.
  // We list directories and root-level files explicitly so passthrough is auditable.
  eleventyConfig.addPassthroughCopy("assets");
  eleventyConfig.addPassthroughCopy("projects");
  eleventyConfig.addPassthroughCopy("videos");
  eleventyConfig.addPassthroughCopy("Hero_Video");
  eleventyConfig.addPassthroughCopy("blog");
  eleventyConfig.addPassthroughCopy("admin");

  // Root-level binary assets and metadata files
  eleventyConfig.addPassthroughCopy("canada-logo.png");
  eleventyConfig.addPassthroughCopy("us-logo.png");
  eleventyConfig.addPassthroughCopy("apple-touch-icon.png");
  eleventyConfig.addPassthroughCopy("favicon-32x32.png");
  eleventyConfig.addPassthroughCopy("favicon-192x192.png");
  eleventyConfig.addPassthroughCopy("og-image.jpg");
  eleventyConfig.addPassthroughCopy("hero-mobile.jpg");
  eleventyConfig.addPassthroughCopy("hero-mobile.webp");
  eleventyConfig.addPassthroughCopy("virtualtours.jpeg");
  eleventyConfig.addPassthroughCopy("Video.mp4");
  eleventyConfig.addPassthroughCopy("Platinum_Final.mp4");
  eleventyConfig.addPassthroughCopy("Final_Video_Hero.mp4");
  eleventyConfig.addPassthroughCopy("after.jpg");
  eleventyConfig.addPassthroughCopy("before.jpg");
  eleventyConfig.addPassthroughCopy("1.png");
  eleventyConfig.addPassthroughCopy("robots.txt");
  eleventyConfig.addPassthroughCopy("llms.txt");
  eleventyConfig.addPassthroughCopy("sitemap.xml"); // will be replaced by sitemap.njk in Task 11

  return {
    dir: {
      input: ".",
      output: "_site",
      includes: "src/_includes",
      data: "_data"
    },
    // Process .html files at the root through Eleventy templating.
    // For Phase 1, those files have NO front-matter, so Eleventy passes them through verbatim.
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
    templateFormats: ["html", "md", "njk"]
  };
};
```

Important: `Hero_Video/` is in `.gitignore` but kept in passthrough so local-dev parity matches prod (Vercel won't have these files but `og-image.jpg` is at the root, separate copy committed). The passthrough call is harmless when the directory is missing locally.

- [ ] **Step 2: Run the build**

```bash
npm run build
```

Expected: Eleventy emits a summary like `Wrote N files in M.MMM seconds`. No errors. A `_site/` directory now exists.

- [ ] **Step 3: Verify _site mirrors the project**

```bash
ls _site/
```

Expected: every existing top-level file (index.html, about.html, services.html, gallery.html, virtual-tours.html, environmental-policy.html, contact.html, blog.html, og-image.jpg, canada-logo.png, etc.) is present. `assets/`, `projects/`, `videos/`, `blog/` directories present.

```bash
ls _site/blog/
```

Expected: `building-out-commercial-space-ontario.html`, `uploads/` (if it exists yet — may not at this stage).

- [ ] **Step 4: Smoke-test the dev server**

Run:

```bash
npm run start
```

Open `http://localhost:8080/` in a browser.

Expected: home page renders identically to current production. Click around — every existing page works (`/about`, `/services`, `/blog`, `/blog/building-out-commercial-space-ontario`, etc.). Stop the server with Ctrl+C.

- [ ] **Step 5: Commit**

```bash
git add .eleventy.js
git commit -m "Add Eleventy config with passthrough copy of all existing static assets"
```

---

### Task 3: Update `vercel.json` to use Eleventy build

**Files:**
- Modify: `vercel.json`

**Why:** Vercel needs to know it should run `npm run build` and serve from `_site/`. Without this it would still serve the project root, ignoring our build.

- [ ] **Step 1: Add buildCommand and outputDirectory**

Open `vercel.json`. Add `buildCommand` and `outputDirectory` keys at the top level (alongside `cleanUrls` and `trailingSlash`):

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "_site",
  "cleanUrls": true,
  "trailingSlash": false,
  "headers": [
    ...existing headers unchanged...
  ]
}
```

The full file should now look like:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "_site",
  "cleanUrls": true,
  "trailingSlash": false,
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" }
      ]
    },
    {
      "source": "/assets/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=3600, must-revalidate" }
      ]
    },
    {
      "source": "/projects/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=86400" }
      ]
    },
    {
      "source": "/videos/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=86400" }
      ]
    }
  ]
}
```

- [ ] **Step 2: Commit**

```bash
git add vercel.json
git commit -m "Vercel: build via npm run build, serve _site/"
```

- [ ] **Step 3: Push to a feature branch (NOT main yet) and verify Vercel preview**

```bash
git checkout -b decap-migration
git push -u origin decap-migration
```

Open the Vercel dashboard. The PR (or branch deploy) should:
- Detect the build command
- Run `npm install` then `npm run build`
- Serve `_site/`

Open the preview URL. Every page should render identically to current production.

If the build fails on Vercel: check the build log for missing assets in passthrough copy. Fix in `.eleventy.js`, recommit, repush.

- [ ] **Step 4: Do NOT merge yet**

We stay on the `decap-migration` branch until phase 4. Each task on this branch will be a commit, eventually all merged together.

---

### Task 4: Update `.vscode/launch.json` to point at the Eleventy dev server

**Files:**
- Modify (or create): `.vscode/launch.json`

**Why:** The previous "Open with live-server" launch becomes obsolete. The new dev workflow is `npm run start`.

- [ ] **Step 1: Inspect the existing file**

```bash
cat .vscode/launch.json
```

If the file exists and references `live-server --port=5500`, replace it. If `.vscode/` is missing or empty, create the file fresh.

- [ ] **Step 2: Write the new content**

Create or replace `.vscode/launch.json` with:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Eleventy dev server",
      "type": "node",
      "request": "launch",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "start"],
      "cwd": "${workspaceFolder}",
      "console": "integratedTerminal"
    }
  ]
}
```

Note: `.vscode/` is in `.gitignore`. This file does not get committed. It's a one-time local config update.

- [ ] **Step 3: No commit needed for this task** (file is gitignored).

---

### Task 5: Phase 1 acceptance — full visual parity check

**Files:** none (manual verification)

**Why:** Before adding any templating or migration logic, prove that the Eleventy passthrough build produces a 100% identical site to current production.

- [ ] **Step 1: Build locally**

```bash
npm run build
```

- [ ] **Step 2: Serve locally**

```bash
npm run start
```

- [ ] **Step 3: Visual parity check on each page**

Open `http://localhost:8080/` and compare side-by-side with `https://platinum-site.vercel.app/`. For each of the following URLs, the rendering must be visually identical:

- `/`
- `/about`
- `/services`
- `/gallery`
- `/virtual-tours`
- `/environmental-policy`
- `/contact`
- `/blog`
- `/blog/building-out-commercial-space-ontario`

Check: header, hero, sections, footer, mobile responsive (resize to 375px). All assets load (no 404 in DevTools Network).

- [ ] **Step 4: If any difference exists, fix the passthrough config in `.eleventy.js` before proceeding.**

This is the gate before phase 2. Do not move on with broken passthrough.

- [ ] **Step 5: No commit needed unless `.eleventy.js` was modified.**

---

## Phase 2 — Templating + content migration

### Task 6: Create the `_data/pages/` JSON files

**Files:**
- Create: `_data/pages/home.json`
- Create: `_data/pages/about.json`
- Create: `_data/pages/services.json`
- Create: `_data/pages/gallery.json`
- Create: `_data/pages/virtual-tours.json`
- Create: `_data/pages/environmental-policy.json`
- Create: `_data/pages/contact.json`
- Create: `_data/pages/blog.json` (for the blog index page)

**Why:** Externalize the SEO meta of the 7 corporate pages + the blog index. Decap will give the SEO team a UI to edit these 8 files. The HTML templates will read from them via `pages[pageKey]`.

**Naming choice:** the directory is named `_data/pages/` (not `_data/seo/`) to avoid name collision with the article-local `seo` front-matter object (articles have their own `seo: {title, description, ogImage}` for per-article overrides).

- [ ] **Step 1: Create `_data/pages/` directory**

```bash
mkdir -p _data/pages
```

- [ ] **Step 2: Create `_data/pages/home.json`**

Inspect the current `<title>`, meta description, og:image of `index.html`, and write:

```json
{
  "title": "Platinum Construction | Commercial GC in Ontario Since 1997",
  "description": "Platinum Construction Corporation — Commercial general contractor, project management and design-build services across Ontario. 27+ years of excellence.",
  "ogImage": "/og-image.jpg"
}
```

- [ ] **Step 3: Create the 6 other JSON files**

Repeat the pattern for each page. Pull the current title / description / og:image from each existing HTML file's `<head>`. Files:

`_data/pages/about.json`:
```json
{
  "title": "About Us | Platinum Construction in Ontario, Canada",
  "description": "Founded in 1997, Platinum Construction is an Ontario general contractor delivering commercial, hospitality and custom builds across Canada and the US.",
  "ogImage": "/og-image.jpg"
}
```

`_data/pages/services.json`:
```json
{
  "title": "Construction Services in Ontario | Platinum Construction",
  "description": "Full-service general contractor: commercial, franchise rollouts, hotels, salon studios, kitchens, residential — from concept to turnkey delivery.",
  "ogImage": "/og-image.jpg"
}
```

`_data/pages/gallery.json`:
```json
{
  "title": "Project Gallery | Platinum Construction in Ontario",
  "description": "Explore our portfolio of commercial, retail, hospitality and restaurant projects delivered across Ontario and North America.",
  "ogImage": "/og-image.jpg"
}
```

`_data/pages/virtual-tours.json`:
```json
{
  "title": "360° Virtual Tours of Our Builds | Platinum Construction",
  "description": "Step inside completed Platinum Construction builds with immersive 360° virtual tours of Starbucks, Chipotle, Sola Salons and other Ontario projects.",
  "ogImage": "/og-image.jpg"
}
```

`_data/pages/environmental-policy.json`:
```json
{
  "title": "Environmental Policy — Platinum Construction Corporation",
  "description": "Platinum Construction's commitment to sustainable construction, energy-efficient design and responsible site management on every Ontario project.",
  "ogImage": "/og-image.jpg"
}
```

`_data/pages/contact.json`:
```json
{
  "title": "Contact Platinum Construction | Ontario & US Offices",
  "description": "Contact Platinum Construction Corporation — Vaughan, Ontario office and US branch. Call, email or request a quote for your commercial build.",
  "ogImage": "/og-image.jpg"
}
```

`_data/pages/blog.json`:
```json
{
  "title": "Construction Insights & Guides | Platinum Construction",
  "description": "Practical commercial construction guides, build-out timelines and project stories from Platinum Construction — 27 years delivering builds across Ontario.",
  "ogImage": "/og-image.jpg"
}
```

- [ ] **Step 4: Commit**

```bash
git add _data/pages/
git commit -m "Add per-page SEO metadata as JSON for templating"
```

---

### Task 7: Create base layout + head-seo partial

**Files:**
- Create: `src/_includes/layouts/base.njk`
- Create: `src/_includes/partials/head-seo.njk`

**Why:** Centralize the `<head>` block so per-page SEO meta drives titles, descriptions, OG/Twitter tags, JSON-LD, and so we don't repeat 30 lines of meta across 7 pages.

- [ ] **Step 1: Create the directory structure**

```bash
mkdir -p src/_includes/layouts src/_includes/partials
```

- [ ] **Step 2: Create `src/_includes/partials/head-seo.njk`**

This partial expects a variable `m` (the SEO meta object: `{ title, description, ogImage }`) to be set by the calling layout BEFORE the include. It's the layout's job to resolve `m` from the right source — either `pages[pageKey]` (for corporate pages) or article-local front-matter.

```njk
{%- set pageUrl = "https://platinum-site.vercel.app" + (canonicalPath or page.url) -%}
<title>{{ m.title }}</title>
<meta name="description" content="{{ m.description }}" />
<meta name="robots" content="index,follow,max-image-preview:large" />
<link rel="canonical" href="{{ pageUrl }}" />
<meta property="og:type" content="{{ ogType or 'website' }}" />
<meta property="og:site_name" content="Platinum Construction Corporation" />
<meta property="og:title" content="{{ m.title }}" />
<meta property="og:description" content="{{ m.description }}" />
<meta property="og:url" content="{{ pageUrl }}" />
<meta property="og:image" content="https://platinum-site.vercel.app{{ m.ogImage }}" />
<meta property="og:locale" content="en_CA" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:site" content="@platinumconst1" />
<meta name="twitter:title" content="{{ m.title }}" />
<meta name="twitter:description" content="{{ m.description }}" />
<meta name="twitter:image" content="https://platinum-site.vercel.app{{ m.ogImage }}" />
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Oswald:wght@300;400;500;600&display=swap" rel="stylesheet">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
<link rel="icon" type="image/png" sizes="192x192" href="/favicon-192x192.png" />
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
<link rel="stylesheet" href="/assets/css/main.css?v=6" />
{% if jsonLd %}
<script type="application/ld+json">{{ jsonLd | dump | safe }}</script>
{% endif %}
```

- [ ] **Step 3: Create `src/_includes/layouts/base.njk`**

This layout is used by the 7 corporate pages and the blog index. Each calling page sets `pageKey` in its front-matter; the layout looks up the SEO meta from `pages[pageKey]` (= `_data/pages/<pageKey>.json`).

```njk
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  {%- set m = pages[pageKey] -%}
  {% include "partials/head-seo.njk" %}
</head>
<body>
{{ content | safe }}
<script src="/assets/js/layout.js?v=6" defer></script>
<script src="/assets/js/main.js?v=6" defer></script>
</body>
</html>
```

- [ ] **Step 4: Build and verify the partial parses**

```bash
npm run build
```

Expected: no template errors. The build succeeds (the layout/partial is not yet used by any page, so no output change).

- [ ] **Step 5: Commit**

```bash
git add src/_includes/
git commit -m "Add base layout + head-seo partial (not wired up yet)"
```

---

### Task 8: Convert the 7 corporate pages to use Eleventy front-matter + base layout

**Files:**
- Modify: `index.html`, `about.html`, `services.html`, `gallery.html`, `virtual-tours.html`, `environmental-policy.html`, `contact.html`

**Why:** Replace each page's hand-coded `<head>` block with a layout reference + front-matter, so the SEO meta is driven by `_data/pages/<page>.json`. The body content of each page is preserved verbatim.

**Strategy:** Each existing HTML page has a `<!DOCTYPE html>...<head>...</head><body>...</body></html>` structure. We:
1. Extract the body content (everything between `<body>` and `</body>`).
2. Replace the entire file with: front-matter block + extracted body.
3. The base layout takes over the `<!DOCTYPE>`, `<head>`, body wrapper, and trailing scripts.

- [ ] **Step 1: Convert `index.html`**

Read the existing `index.html`. Its current `<head>` includes a complex JSON-LD `@graph` with Organization + WebSite + WebPage schemas — this must be preserved. We pass it as a `jsonLd` front-matter variable. The `pageKey: home` tells `base.njk` to look up `pages.home` for the SEO meta.

Replace the file with:

```html
---
layout: layouts/base.njk
permalink: /index.html
canonicalPath: /
pageKey: home
ogType: website
jsonLd:
  "@context": "https://schema.org"
  "@graph":
    - "@type": ["Organization", "GeneralContractor", "LocalBusiness"]
      "@id": "https://platinum-site.vercel.app/#organization"
      name: "Platinum Construction Corporation"
      url: "https://platinum-site.vercel.app/"
      logo: "https://platinum-site.vercel.app/canada-logo.png"
      image: "https://platinum-site.vercel.app/og-image.jpg"
      description: "Commercial general contractor delivering design-build, franchise rollouts, hospitality and custom residential projects across Ontario and the US since 1997."
      foundingDate: "1997"
      telephone: "+1-905-763-8119"
      address:
        "@type": "PostalAddress"
        streetAddress: "83 Citation Dr. Unit 2"
        addressLocality: "Vaughan"
        addressRegion: "ON"
        postalCode: "L4K 2Z6"
        addressCountry: "CA"
      areaServed:
        - "@type": "Country"
          name: "Canada"
        - "@type": "Country"
          name: "United States"
      sameAs:
        - "https://twitter.com/platinumconst1"
        - "https://www.instagram.com/platinum_construction_corp"
        - "https://www.linkedin.com/company/platinum-construction-corporation"
      subOrganization:
        "@type": ["Organization", "LocalBusiness"]
        "@id": "https://platinum-site.vercel.app/#organization-us"
        name: "Platinum Construction of America, Inc."
        telephone: "+1-855-763-8119"
        address:
          "@type": "PostalAddress"
          streetAddress: "1441 Broadway, 6th Floor, Suite 6075"
          addressLocality: "New York"
          addressRegion: "NY"
          postalCode: "10018"
          addressCountry: "US"
        parentOrganization:
          "@id": "https://platinum-site.vercel.app/#organization"
    - "@type": "WebSite"
      "@id": "https://platinum-site.vercel.app/#website"
      url: "https://platinum-site.vercel.app/"
      name: "Platinum Construction Corporation"
      publisher:
        "@id": "https://platinum-site.vercel.app/#organization"
      inLanguage: "en-CA"
    - "@type": "WebPage"
      "@id": "https://platinum-site.vercel.app/#webpage"
      url: "https://platinum-site.vercel.app/"
      name: "Platinum Construction | Commercial GC in Ontario Since 1997"
      isPartOf:
        "@id": "https://platinum-site.vercel.app/#website"
      about:
        "@id": "https://platinum-site.vercel.app/#organization"
      inLanguage: "en-CA"
---
{# Body content of the home page — extracted verbatim from the previous index.html #}
{# (paste the entire contents that was between <body> and </body> in the original file, EXCLUDING the trailing <script src="assets/js/layout.js?v=6">...</script> tags — those are handled by base.njk) #}

[INSERT EXTRACTED BODY CONTENT HERE]
```

The extracted body must be the literal HTML from the original `index.html`'s body, with two adjustments:
- Remove the `<script src="assets/js/layout.js?v=6">...</script>` and `<script src="assets/js/main.js?v=6">...</script>` lines (base.njk adds them).
- All asset paths that were relative (`canada-logo.png`, `assets/css/main.css`, etc.) must remain unchanged — they resolve correctly because the page is at `/index.html` after build.

To make this concrete: read the current `index.html` line by line. Identify lines `<body>` (start) and `</body>` (end). Copy everything between them — except the two final `<script>` tags — into the front-matter file under the `---` separator. The `pageKey: home` directive makes `base.njk` look up SEO meta from `_data/pages/home.json` automatically.

- [ ] **Step 2: Build and verify home page parity**

```bash
npm run build
npm run start
```

Open `http://localhost:8080/`. Verify visually that the home page renders identically to current production. Check DevTools:
- `<title>` matches `seo.home.title`
- `<meta name="description">` matches `seo.home.description`
- `<script type="application/ld+json">` is present and contains the Organization + WebSite + WebPage graph

If anything is broken, fix before proceeding.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "Convert index.html to Eleventy template with seo + jsonLd front-matter"
```

- [ ] **Step 4: Repeat the conversion for `about.html`**

Same pattern. The about page's existing JSON-LD is simpler (just WebPage + BreadcrumbList). Front-matter:

```yaml
---
layout: layouts/base.njk
permalink: /about.html
canonicalPath: /about
pageKey: about
ogType: website
jsonLd:
  "@context": "https://schema.org"
  "@graph":
    - "@type": "WebPage"
      "@id": "https://platinum-site.vercel.app/about#webpage"
      url: "https://platinum-site.vercel.app/about"
      name: "About Us | Platinum Construction in Ontario, Canada"
      isPartOf:
        "@id": "https://platinum-site.vercel.app/#website"
      about:
        "@id": "https://platinum-site.vercel.app/#organization"
      inLanguage: "en-CA"
    - "@type": "BreadcrumbList"
      itemListElement:
        - "@type": "ListItem"
          position: 1
          name: "Home"
          item: "https://platinum-site.vercel.app/"
        - "@type": "ListItem"
          position: 2
          name: "About"
          item: "https://platinum-site.vercel.app/about"
---
[paste body of about.html, minus the trailing scripts]
```

Build, verify visual parity at `http://localhost:8080/about`, then commit:

```bash
git add about.html
git commit -m "Convert about.html to Eleventy template"
```

- [ ] **Step 5: Repeat for the 5 remaining pages**

For each of `services.html`, `gallery.html`, `virtual-tours.html`, `environmental-policy.html`, `contact.html`:
1. Read the current file
2. Copy its existing JSON-LD into the front-matter `jsonLd` block (each is a `WebPage` + `BreadcrumbList` graph — same shape as `about.html` above, just different URL/name fields)
3. Set `pageKey: <key>` where `<key>` matches the JSON filename without extension (e.g. `pageKey: services` for `services.html`)
4. Set `permalink` and `canonicalPath` matching current URLs
5. Replace body, build, verify, commit one page at a time

After this task, all 7 corporate pages render through Eleventy templates pulling from `_data/pages/`.

- [ ] **Step 6: Final visual parity sweep**

```bash
npm run build && npm run start
```

Open every page on `http://localhost:8080/` and confirm zero visual regression vs production. View source on each, confirm `<title>`, meta tags, and JSON-LD all match what was there before.

---

### Task 9: Add custom Eleventy filters (readingTime, formatDate) + articles collection

**Files:**
- Modify: `.eleventy.js`

**Why:** The article template (next task) needs to compute reading time from the markdown body, format dates human-readable, and access the list of articles for the blog index.

- [ ] **Step 1: Update `.eleventy.js`**

Replace the existing `.eleventy.js` with this enhanced version (which keeps all the passthrough copy from Task 2 and adds filters + collection):

```js
const markdownIt = require("markdown-it");

module.exports = function (eleventyConfig) {
  // ----- Passthrough copy (from Task 2, unchanged) -----
  eleventyConfig.addPassthroughCopy("assets");
  eleventyConfig.addPassthroughCopy("projects");
  eleventyConfig.addPassthroughCopy("videos");
  eleventyConfig.addPassthroughCopy("Hero_Video");
  eleventyConfig.addPassthroughCopy("blog");
  eleventyConfig.addPassthroughCopy("admin");
  eleventyConfig.addPassthroughCopy("canada-logo.png");
  eleventyConfig.addPassthroughCopy("us-logo.png");
  eleventyConfig.addPassthroughCopy("apple-touch-icon.png");
  eleventyConfig.addPassthroughCopy("favicon-32x32.png");
  eleventyConfig.addPassthroughCopy("favicon-192x192.png");
  eleventyConfig.addPassthroughCopy("og-image.jpg");
  eleventyConfig.addPassthroughCopy("hero-mobile.jpg");
  eleventyConfig.addPassthroughCopy("hero-mobile.webp");
  eleventyConfig.addPassthroughCopy("virtualtours.jpeg");
  eleventyConfig.addPassthroughCopy("Video.mp4");
  eleventyConfig.addPassthroughCopy("Platinum_Final.mp4");
  eleventyConfig.addPassthroughCopy("Final_Video_Hero.mp4");
  eleventyConfig.addPassthroughCopy("after.jpg");
  eleventyConfig.addPassthroughCopy("before.jpg");
  eleventyConfig.addPassthroughCopy("1.png");
  eleventyConfig.addPassthroughCopy("robots.txt");
  eleventyConfig.addPassthroughCopy("llms.txt");
  // sitemap.xml is now generated by src/sitemap.njk — passthrough removed.

  // ----- Markdown configuration -----
  const md = markdownIt({ html: true, linkify: true, typographer: true });
  eleventyConfig.setLibrary("md", md);

  // ----- Custom filters -----

  // readingTime: estimates minutes from a markdown string at ~200 wpm.
  eleventyConfig.addFilter("readingTime", (text) => {
    if (!text) return 1;
    const words = text.trim().split(/\s+/).length;
    return Math.max(1, Math.round(words / 200));
  });

  // formatDate: turns a JS Date or ISO string into "Month D, YYYY" (en-US).
  eleventyConfig.addFilter("formatDate", (value) => {
    const d = value instanceof Date ? value : new Date(value);
    return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  });

  // dateISO: returns YYYY-MM-DD for <time datetime="...">.
  eleventyConfig.addFilter("dateISO", (value) => {
    const d = value instanceof Date ? value : new Date(value);
    return d.toISOString().slice(0, 10);
  });

  // ----- Collections -----

  // articles: every .md file under content/blog/, sorted by date desc.
  eleventyConfig.addCollection("articles", (collectionApi) =>
    collectionApi
      .getFilteredByGlob("content/blog/*.md")
      .sort((a, b) => new Date(b.data.date) - new Date(a.data.date))
  );

  return {
    dir: {
      input: ".",
      output: "_site",
      includes: "src/_includes",
      data: "_data"
    },
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
    templateFormats: ["html", "md", "njk"]
  };
};
```

Note: we removed `eleventyConfig.addPassthroughCopy("sitemap.xml")` because sitemap will now be generated by Eleventy in Task 11. The existing `sitemap.xml` at the project root will be deleted in that task.

- [ ] **Step 2: Build and verify no regression**

```bash
npm run build
```

Expected: build succeeds. Pages still render. The new filters and collection are defined but unused yet — no behavior change.

- [ ] **Step 3: Commit**

```bash
git add .eleventy.js
git commit -m "Add markdown-it config, readingTime/formatDate/dateISO filters, articles collection"
```

---

### Task 10: Create the article layout + migrate the existing article to markdown

**Files:**
- Create: `src/_includes/layouts/article.njk`
- Create: `content/blog/building-out-commercial-space-ontario.md`
- Create: `blog/uploads/building-out-cover.jpg` (copy from `projects/`)
- Delete: `blog/building-out-commercial-space-ontario.html`

**Why:** Replace the hand-authored HTML article with a markdown source rendered via Eleventy. The output URL stays identical (`/blog/building-out-commercial-space-ontario`), so SEO is preserved.

- [ ] **Step 1: Copy the cover image to `blog/uploads/`**

```bash
mkdir -p blog/uploads
cp "projects/New Plaza Development - 171 George Reynolds Dr. Courtice, ON/image_5.jpg" blog/uploads/building-out-cover.jpg
```

- [ ] **Step 2: Create the article layout `src/_includes/layouts/article.njk`**

This is a **standalone** layout — it does NOT extend `base.njk`. We make it standalone because Eleventy's layout chaining doesn't let an article's local `seo` front-matter propagate to a parent layout's `<head>` reliably; duplicating ~30 lines of head boilerplate here avoids that pitfall and keeps the article rendering deterministic.

```njk
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  {%- set m = {
    title: (seo.title if seo and seo.title else title + " | Platinum Construction"),
    description: (seo.description if seo and seo.description else lead),
    ogImage: (seo.ogImage if seo and seo.ogImage else cover)
  } -%}
  {%- set canonicalPath = "/blog/" + page.fileSlug -%}
  {%- set ogType = "article" -%}
  {%- set jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "@id": "https://platinum-site.vercel.app/blog/" + page.fileSlug + "#article",
        "headline": title,
        "description": lead,
        "datePublished": date | dateISO,
        "dateModified": date | dateISO,
        "image": "https://platinum-site.vercel.app" + (m.ogImage),
        "author": { "@id": "https://platinum-site.vercel.app/#organization" },
        "publisher": { "@id": "https://platinum-site.vercel.app/#organization" },
        "mainEntityOfPage": "https://platinum-site.vercel.app/blog/" + page.fileSlug,
        "articleSection": category,
        "inLanguage": "en-CA"
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://platinum-site.vercel.app/" },
          { "@type": "ListItem", "position": 2, "name": "Blog", "item": "https://platinum-site.vercel.app/blog" },
          { "@type": "ListItem", "position": 3, "name": title, "item": "https://platinum-site.vercel.app/blog/" + page.fileSlug }
        ]
      }
    ]
  } -%}
  {% include "partials/head-seo.njk" %}
</head>
<body>

<header class="site-header light-header">
  <div class="container header-inner">
    <a href="/index.html" class="logo"><img src="/canada-logo.png" alt="Platinum Construction Corporation" class="logo-ca" /><span class="logo-divider"></span><img src="/us-logo.png" alt="Platinum Construction of America, Inc." class="logo-us" /></a>
    <nav class="nav-desktop">
      <a href="/index.html">Home</a>
      <a href="/about.html">About</a>
      <a href="/services.html">Services</a>
      <a href="/gallery.html">Gallery</a>
      <a href="/virtual-tours.html">Virtual Tours</a>
      <a href="/environmental-policy.html">Environmental</a>
      <a href="/blog.html" class="active">Blog</a>
      <a href="/contact.html">Contact</a>
    </nav>
    <a href="/contact.html" class="btn btn-ghost header-cta" style="padding:14px 26px;font-size:.75rem;">Get a Quote <span class="arrow"></span></a>
    <button class="burger"><span></span><span></span><span></span></button>
  </div>
</header>

<div class="nav-overlay">
  <ul>
    <li><a href="/index.html">Home</a></li>
    <li><a href="/about.html">About</a></li>
    <li><a href="/services.html">Services</a></li>
    <li><a href="/gallery.html">Gallery</a></li>
    <li><a href="/virtual-tours.html">Virtual Tours</a></li>
    <li><a href="/environmental-policy.html">Environmental</a></li>
    <li><a href="/blog.html">Blog</a></li>
    <li><a href="/contact.html">Contact</a></li>
  </ul>
</div>

<article class="article">
  <div class="container">
    <nav class="article__breadcrumb" aria-label="Breadcrumb">
      <a href="/blog.html">Blog</a>
      <span aria-hidden="true">›</span>
      <span>{{ category }}</span>
    </nav>

    <h1 class="article__title">{{ title }}</h1>
    <p class="article__lead">{{ lead }}</p>

    <div class="article__meta">
      <time datetime="{{ date | dateISO }}">{{ date | formatDate }}</time>
      <span aria-hidden="true">·</span>
      <span>{{ content | striptags | readingTime }} min read</span>
      <span aria-hidden="true">·</span>
      <span class="article__category">{{ category }}</span>
    </div>

    <div class="article__cover" style="background-image:url('{{ cover }}');" role="img" aria-label="Article cover image"></div>

    <div class="article__body">
      {{ content | safe }}
    </div>

    <aside class="article-cta">
      <h3 class="article-cta__title">Planning a build-out?</h3>
      <p class="article-cta__copy">Platinum Construction has delivered over 500 commercial projects across Ontario and the US since 1997 — restaurants, retail, coffee, and custom spaces.</p>
      <a href="/contact.html" class="btn btn-primary article-cta__btn">Get a free quote <span class="arrow"></span></a>
    </aside>
  </div>
</article>

{# Footer is reproduced inline here for simplicity. If it grows, factor into partials/footer.njk in a future task. #}
<footer class="site-footer">
  <div class="container">
    <div class="footer-top">
      <div class="footer-col">
        <div class="footer-logo"><img src="/canada-logo.png" alt="Platinum Construction" class="footer-logo-ca" /><span class="footer-logo-divider"></span><img src="/us-logo.png" alt="Platinum Construction of America" class="footer-logo-us" /></div>
        <p class="footer-about">Commercial general contractor, project management and design-build services across Ontario — delivering turnkey quality since 1997.</p>
        <div class="footer-social">
          <a href="https://www.facebook.com/people/Platinum-Construction-Corporation/100064126741481/" aria-label="Facebook"><svg viewBox="0 0 24 24"><path d="M12 2C6.5 2 2 6.5 2 12c0 5 3.7 9.1 8.4 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.3v7C18.3 21.1 22 17 22 12c0-5.5-4.5-10-10-10z"/></svg></a>
          <a href="https://www.instagram.com/platinum_construction_corp/" aria-label="Instagram"><svg viewBox="0 0 24 24"><path d="M12 2.2c3.2 0 3.6 0 4.8.1 1.2.1 1.8.2 2.2.4.6.2 1 .5 1.4.9.4.4.7.9.9 1.4.2.4.4 1 .4 2.2.1 1.3.1 1.6.1 4.8s0 3.6-.1 4.8c-.1 1.2-.2 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.9.7-1.4.9-.4.2-1 .4-2.2.4-1.3.1-1.6.1-4.8.1s-3.6 0-4.8-.1c-1.2-.1-1.8-.2-2.2-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.9-.9-1.4-.2-.4-.4-1-.4-2.2-.1-1.3-.1-1.6-.1-4.8s0-3.6.1-4.8c.1-1.2.2-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.9-.7 1.4-.9.4-.2 1-.4 2.2-.4 1.2-.1 1.6-.1 4.8-.1zm0 5.3c-2.5 0-4.5 2-4.5 4.5s2 4.5 4.5 4.5 4.5-2 4.5-4.5-2-4.5-4.5-4.5zm0 7.5c-1.7 0-3-1.3-3-3s1.3-3 3-3 3 1.3 3 3-1.3 3-3 3zm4.7-7.7c-.6 0-1-.5-1-1s.5-1 1-1 1 .5 1 1-.5 1-1 1z"/></svg></a>
          <a href="https://mobile.twitter.com/platinumconst1" aria-label="Twitter"><svg viewBox="0 0 24 24"><path d="M22 5.8c-.7.3-1.5.5-2.4.6.9-.5 1.5-1.3 1.8-2.3-.8.5-1.7.8-2.6 1-.8-.8-1.9-1.3-3.1-1.3-2.3 0-4.2 1.9-4.2 4.2 0 .3 0 .7.1 1C8.1 8.9 5.1 7.3 3 4.8c-.4.6-.6 1.3-.6 2.1 0 1.5.7 2.8 1.9 3.5-.7 0-1.3-.2-1.9-.5v.1c0 2 1.5 3.7 3.4 4.1-.4.1-.7.2-1.1.2-.3 0-.5 0-.8-.1.5 1.6 2 2.8 3.9 2.9-1.4 1.1-3.2 1.8-5.2 1.8-.3 0-.7 0-1-.1 1.9 1.2 4 1.9 6.3 1.9 7.5 0 11.6-6.2 11.6-11.6v-.5c.8-.5 1.5-1.2 2-2z"/></svg></a>
          <a href="https://www.linkedin.com/company/platinum-construction-corporation" aria-label="LinkedIn"><svg viewBox="0 0 24 24"><path d="M20.5 2h-17C2.7 2 2 2.7 2 3.5v17c0 .8.7 1.5 1.5 1.5h17c.8 0 1.5-.7 1.5-1.5v-17c0-.8-.7-1.5-1.5-1.5zM8 18.5H5V10h3v8.5zM6.5 8.3c-1 0-1.7-.8-1.7-1.7S5.5 5 6.5 5s1.7.8 1.7 1.7-.8 1.6-1.7 1.6zM19 18.5h-3v-4.4c0-1.1 0-2.4-1.5-2.4s-1.7 1.2-1.7 2.4v4.5h-3V10h2.9v1.3c.4-.8 1.4-1.5 2.8-1.5 3 0 3.5 2 3.5 4.5v4.2z"/></svg></a>
        </div>
      </div>
      <div class="footer-col">
        <h4>Navigate</h4>
        <ul>
          <li><a href="/index.html">Home</a></li>
          <li><a href="/about.html">About</a></li>
          <li><a href="/services.html">Services</a></li>
          <li><a href="/gallery.html">Gallery</a></li>
          <li><a href="/virtual-tours.html">Virtual Tours</a></li>
          <li><a href="/environmental-policy.html">Environmental Policy</a></li>
          <li><a href="/blog.html">Blog</a></li>
          <li><a href="/contact.html">Contact</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>Services</h4>
        <ul>
          <li><a href="/services.html">Commercial Construction</a></li>
          <li><a href="/services.html">Franchise Rollouts</a></li>
          <li><a href="/services.html">Hotel Turnkey</a></li>
          <li><a href="/services.html">Salon Studios</a></li>
          <li><a href="/services.html">Commercial Kitchens</a></li>
          <li><a href="/services.html">Custom Homes</a></li>
        </ul>
      </div>
      <div class="footer-col footer-contact">
        <h4>Contact</h4>
        <p><strong>Canada</strong>83 Citation Dr. Unit 2<br />Vaughan, ON L4K 2Z6<br /><a href="tel:9057638119">905-763-8119</a></p><p><strong>United States</strong>1441 Broadway, Suite 6075<br />New York, NY 10018<br /><a href="tel:18557638119">1-855-763-8119</a></p>
        <p><strong>Email</strong><a href="mailto:info&#64;platinumconstruction&#46;com">info&#64;platinumconstruction&#46;com</a></p>
      </div>
    </div>
    <div class="footer-bottom">
      <div>&copy; <span data-year>2026</span> Platinum Construction Corporation. All rights reserved.</div>
      <div>Building excellence since 1997.</div>
    </div>
  </div>
</footer>

<script src="/assets/js/layout.js?v=6" defer></script>
<script src="/assets/js/main.js?v=6" defer></script>
</body>
</html>
```

- [ ] **Step 3: Create the markdown source `content/blog/building-out-commercial-space-ontario.md`**

Read the current `blog/building-out-commercial-space-ontario.html`. Extract the body content from inside `<div class="article__body">...</div>`. Convert each HTML element to markdown using these rules:
- `<h2>X</h2>` → `## X`
- `<h3>X</h3>` → `### X`
- `<p>X</p>` → blank line + `X` + blank line
- `<strong>X</strong>` → `**X**`
- `<em>X</em>` → `*X*`
- `<a href="URL">X</a>` → `[X](URL)`
- `<ul><li>X</li>...</ul>` → `- X` lines
- `<ol><li>X</li>...</ol>` → `1. X` lines
- `<table>` with `<thead>` and `<tbody>` → markdown table syntax with `| col | col |` and `| --- | --- |` separator

Then create the markdown file with this front-matter:

```markdown
---
layout: layouts/article.njk
permalink: /blog/{{ page.fileSlug }}.html
title: "What to Expect When Building Out a Commercial Space in Ontario"
date: 2026-04-29
category: "Build-Out Guide"
lead: "From signing the lease to opening the doors — a practical timeline for tenants, franchisees, and first-time operators."
cover: "/blog/uploads/building-out-cover.jpg"
seo:
  title: "Commercial Build-Out Guide for Ontario Tenants | Platinum"
  description: "A practical timeline for tenants, franchisees, and first-time operators — lease, permits, construction, and inspections for Ontario commercial build-outs."
  ogImage: "/blog/uploads/building-out-cover.jpg"
---

Opening a new commercial space — whether it's a coffee shop, a restaurant, a retail store, or a multi-tenant plaza unit — is one of the biggest investments a tenant or franchisee will ever make. The construction phase alone can run anywhere from eight weeks to seven months depending on scope. For first-time operators, the gap between "lease signed" and "doors open" is often where surprises and budget overruns hide.

This guide walks through the five phases of a typical Ontario commercial build-out, what to expect at each stage, and the pitfalls that consistently catch new tenants off guard. For an overview of how Platinum delivers these projects end-to-end, see our [construction services](/services.html).

## Step 1 — Lease & landlord coordination

The build-out actually begins before the lease is signed. The landlord's **work letter** defines what is delivered as base building (typically structure, demising walls, basic HVAC trunk, washroom rough-in) versus what falls to the tenant. Negotiating this scope is the single biggest cost lever you have — anything in the work letter is paid by the landlord, anything outside it is on you.

Common items to push for: extra electrical capacity, additional HVAC tonnage, demising-wall finishes, exterior storefront. Common items left to the tenant: interior partitions, all finishes, kitchen and serving equipment, signage, fire-suppression upgrades.

## Step 2 — Design & permit drawings

Once the lease is firm, the tenant retains an architect (and usually a mechanical/electrical/plumbing engineer) to produce two sets of drawings: a **design intent** set used for landlord approval, and a more detailed **permit set** that the municipality will review.

For a typical 2,000–3,500 sq ft restaurant or retail unit, allow four to eight weeks for design. Franchise concepts move faster because the brand provides a prototype design package, but the local engineer still has to adapt mechanical and electrical to the specific suite.

Three things slow this stage down more than anything else:

- Late decisions on equipment (especially restaurant kitchens — cut sheets drive the entire MEP layout).
- Landlord redlines arriving piecemeal instead of in a single review pass.
- Site conditions discovered late (asbestos in older buildings, undersized electrical service, missing gas service).

## Step 3 — Permits & approvals

In Ontario, a commercial build-out almost always requires a building permit from the municipality. Depending on the use, you may also need:

- **Public Health Unit approval** — mandatory for any food-service operation, reviewed alongside or after the building permit.
- **TSSA registration** — Technical Standards and Safety Authority, for any gas-fired equipment (kitchen ranges, fryers, water heaters, rooftop units).
- **ESA inspection** — Electrical Safety Authority, separate from the building permit, mandatory for all electrical work.
- **Signage permit** — usually a separate application, sometimes through a different department.
- **Liquor licence (AGCO)** — for restaurants with bar service, runs in parallel and can be the long pole if started late.

Permit timelines vary widely by municipality. In the GTA, expect three to six weeks from a clean submission to permit-in-hand. Smaller jurisdictions can be faster; larger or busier ones (Toronto, Mississauga) can stretch longer, especially if the application kicks back for revisions. Plan for at least one round of comments — submissions that pass on the first review are the exception, not the rule.

## Step 4 — Construction phase

With permits in hand, the general contractor mobilizes. A typical commercial build-out runs through five overlapping stages:

1. **Demolition & site prep** — strip back to base building, expose existing services. Often turns up surprises (capped drains in the wrong spot, undersized electrical feeds).
2. **Framing & rough-in** — partition walls, plumbing and electrical rough, HVAC ductwork, fire-suppression piping. This is the longest single block and where most of the inspections happen.
3. **Drywall, ceilings, finishes** — closing in the walls, painting, flooring, millwork installation.
4. **Final MEP & equipment set** — fixtures, light fittings, HVAC commissioning, kitchen equipment installation, gas connections.
5. **Punch list & deficiency walk** — the tenant walks the space with the GC and lists every item still to be addressed before opening.

Owner-supplied items (FF&E — furniture, fixtures, equipment) are a perennial schedule risk. Anything the tenant orders directly must arrive on time and to the right spec, or the GC's sequencing falls apart. Restaurant equipment, custom millwork, and signage are the most common culprits.

## Step 5 — Inspections & occupancy

Before opening, the project must pass final inspections from the building department, ESA, the health unit (if applicable), and TSSA (if applicable). Each is independent — passing one doesn't mean the next is automatic.

Once cleared, the municipality issues an **occupancy permit** (or its equivalent — terminology varies). Only then can the tenant legally open to the public.

Plan a deficiency window of one to two weeks between substantial completion and the soft-opening date. Trying to open on the same day construction wraps almost always backfires. Examples of restaurant, retail and coffee builds delivered through this exact sequence are in our [project gallery](/gallery.html).

## Realistic timelines

Every project is different, but these are typical ranges for Ontario commercial build-outs from *permit-in-hand* to *occupancy*:

| Project type | Typical duration |
| --- | --- |
| Small retail (under 1,500 sq ft) | 8–12 weeks |
| Coffee shop or QSR (1,500–2,500 sq ft) | 10–14 weeks |
| Full-service restaurant (2,500–4,500 sq ft) | 14–20 weeks |
| Multi-unit plaza or larger fit-out | 20–28 weeks |

Add four to ten weeks of design and permitting on top of these. A common rule of thumb: from lease signing to opening day, allow six to nine months for a restaurant, four to six months for retail.

## Common pitfalls — and how to avoid them

- **Under-scoping the landlord work letter.** Every item missed in the work letter becomes a tenant cost. Walk the site with the GC and the architect *before* signing the lease.
- **Late equipment ordering.** Long-lead items (rooftop HVAC units, custom kitchen equipment, signage) need to be ordered the moment design is locked, not when the GC asks for them.
- **Rushing permit drawings.** Submissions with missing details get kicked back, and a single revision round can add three weeks. Investing one extra week on the front end almost always saves time on the back end.
- **Skipping the pre-construction meeting with the landlord.** Loading dock access, after-hours work rules, deliveries, dust control — every landlord has rules, and finding out mid-construction is expensive.
- **Treating soft-opening as the deadline.** The hard deadline is occupancy permit, not opening day. Build in a deficiency buffer.

A well-planned build-out is a series of decisions made early, in the right order, with the right people in the room. The construction phase itself is the most visible part — but most of what determines whether a project finishes on time and on budget happens before a single wall is framed.
```

- [ ] **Step 4: Delete the old HTML article**

```bash
git rm blog/building-out-commercial-space-ontario.html
```

- [ ] **Step 5: Build and verify article parity**

```bash
npm run build
npm run start
```

Open `http://localhost:8080/blog/building-out-commercial-space-ontario`. The article should render identically to the old HTML version: same title, lead, meta line (with auto-computed reading time, should be ~7 min), cover image, all H2 sections in Oswald uppercase, gold-bulleted lists, timeline table, CTA card linking to `/contact.html`.

View source:
- `<title>` matches `seo.title` from front-matter
- JSON-LD `Article` schema present with correct `headline`, `datePublished`, `image`
- Meta tags all present

If anything is off, fix the layout or front-matter before committing.

- [ ] **Step 6: Commit**

```bash
git add src/_includes/layouts/article.njk content/blog/building-out-commercial-space-ontario.md blog/uploads/building-out-cover.jpg
git commit -m "Migrate first article to markdown + create article layout"
```

---

### Task 11: Convert `blog.html` to Eleventy template + create auto-generated `sitemap.xml`

**Files:**
- Modify: `blog.html` (replace with Eleventy template that lists from `articles` collection)
- Create: `src/sitemap.njk`
- Delete: `sitemap.xml` (root-level, replaced by template)

**Why:** Both the blog index and the sitemap need to auto-update when the SEO team adds/removes articles. Hardcoded versions become stale.

- [ ] **Step 1: Convert `blog.html` to Eleventy template**

Read the current `blog.html`. Replace it entirely with:

```html
---
layout: layouts/base.njk
permalink: /blog.html
canonicalPath: /blog
pageKey: blog
ogType: website
jsonLd:
  "@context": "https://schema.org"
  "@graph":
    - "@type": "Blog"
      "@id": "https://platinum-site.vercel.app/blog#blog"
      url: "https://platinum-site.vercel.app/blog"
      name: "Platinum Construction Insights"
      publisher:
        "@id": "https://platinum-site.vercel.app/#organization"
      inLanguage: "en-CA"
    - "@type": "BreadcrumbList"
      itemListElement:
        - "@type": "ListItem"
          position: 1
          name: "Home"
          item: "https://platinum-site.vercel.app/"
        - "@type": "ListItem"
          position: 2
          name: "Blog"
          item: "https://platinum-site.vercel.app/blog"
---

<header class="site-header light-header">
  <div class="container header-inner">
    <a href="/index.html" class="logo"><img src="/canada-logo.png" alt="Platinum Construction Corporation" class="logo-ca" /><span class="logo-divider"></span><img src="/us-logo.png" alt="Platinum Construction of America, Inc." class="logo-us" /></a>
    <nav class="nav-desktop">
      <a href="/index.html">Home</a>
      <a href="/about.html">About</a>
      <a href="/services.html">Services</a>
      <a href="/gallery.html">Gallery</a>
      <a href="/virtual-tours.html">Virtual Tours</a>
      <a href="/environmental-policy.html">Environmental</a>
      <a href="/blog.html" class="active">Blog</a>
      <a href="/contact.html">Contact</a>
    </nav>
    <a href="/contact.html" class="btn btn-ghost header-cta" style="padding:14px 26px;font-size:.75rem;">Get a Quote <span class="arrow"></span></a>
    <button class="burger"><span></span><span></span><span></span></button>
  </div>
</header>

<div class="nav-overlay">
  <ul>
    <li><a href="/index.html">Home</a></li>
    <li><a href="/about.html">About</a></li>
    <li><a href="/services.html">Services</a></li>
    <li><a href="/gallery.html">Gallery</a></li>
    <li><a href="/virtual-tours.html">Virtual Tours</a></li>
    <li><a href="/environmental-policy.html">Environmental</a></li>
    <li><a href="/blog.html">Blog</a></li>
    <li><a href="/contact.html">Contact</a></li>
  </ul>
</div>

<section class="page-hero">
  <div class="page-hero-bg" style="background-image:url('/projects/New Plaza Development - 171 George Reynolds Dr. Courtice, ON/image_3.jpg');"></div>
  <div class="container page-hero-content">
    <div class="eyebrow">Insights</div>
    <h1>Construction guides<br />&amp; project stories.</h1>
    <div class="breadcrumb"><a href="/index.html">Home</a><span class="sep">/</span>Blog</div>
  </div>
</section>

<section class="blog-index">
  <div class="container">
    <div class="blog-grid">
      {%- for article in collections.articles -%}
        {%- set body = article.templateContent | striptags -%}
        <a href="/blog/{{ article.fileSlug }}.html" class="blog-card">
          <div class="blog-card__cover" style="background-image:url('{{ article.data.cover }}');"></div>
          <div class="blog-card__body">
            <div class="blog-card__meta">{{ article.data.category }} · {{ body | readingTime }} min read</div>
            <h2 class="blog-card__title">{{ article.data.title }}</h2>
            <p class="blog-card__excerpt">{{ article.data.lead }}</p>
            <div class="blog-card__date">{{ article.data.date | formatDate }}</div>
          </div>
        </a>
      {%- endfor -%}
    </div>
  </div>
</section>

{# Footer reproduced inline (same as article.njk). #}
<footer class="site-footer">
  <div class="container">
    <div class="footer-top">
      <div class="footer-col">
        <div class="footer-logo"><img src="/canada-logo.png" alt="Platinum Construction" class="footer-logo-ca" /><span class="footer-logo-divider"></span><img src="/us-logo.png" alt="Platinum Construction of America" class="footer-logo-us" /></div>
        <p class="footer-about">Commercial general contractor, project management and design-build services across Ontario — delivering turnkey quality since 1997.</p>
        <div class="footer-social">
          <a href="https://www.facebook.com/people/Platinum-Construction-Corporation/100064126741481/" aria-label="Facebook"><svg viewBox="0 0 24 24"><path d="M12 2C6.5 2 2 6.5 2 12c0 5 3.7 9.1 8.4 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.3v7C18.3 21.1 22 17 22 12c0-5.5-4.5-10-10-10z"/></svg></a>
          <a href="https://www.instagram.com/platinum_construction_corp/" aria-label="Instagram"><svg viewBox="0 0 24 24"><path d="M12 2.2c3.2 0 3.6 0 4.8.1 1.2.1 1.8.2 2.2.4.6.2 1 .5 1.4.9.4.4.7.9.9 1.4.2.4.4 1 .4 2.2.1 1.3.1 1.6.1 4.8s0 3.6-.1 4.8c-.1 1.2-.2 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.9.7-1.4.9-.4.2-1 .4-2.2.4-1.3.1-1.6.1-4.8.1s-3.6 0-4.8-.1c-1.2-.1-1.8-.2-2.2-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.9-.9-1.4-.2-.4-.4-1-.4-2.2-.1-1.3-.1-1.6-.1-4.8s0-3.6.1-4.8c.1-1.2.2-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.9-.7 1.4-.9.4-.2 1-.4 2.2-.4 1.2-.1 1.6-.1 4.8-.1zm0 5.3c-2.5 0-4.5 2-4.5 4.5s2 4.5 4.5 4.5 4.5-2 4.5-4.5-2-4.5-4.5-4.5zm0 7.5c-1.7 0-3-1.3-3-3s1.3-3 3-3 3 1.3 3 3-1.3 3-3 3zm4.7-7.7c-.6 0-1-.5-1-1s.5-1 1-1 1 .5 1 1-.5 1-1 1z"/></svg></a>
          <a href="https://mobile.twitter.com/platinumconst1" aria-label="Twitter"><svg viewBox="0 0 24 24"><path d="M22 5.8c-.7.3-1.5.5-2.4.6.9-.5 1.5-1.3 1.8-2.3-.8.5-1.7.8-2.6 1-.8-.8-1.9-1.3-3.1-1.3-2.3 0-4.2 1.9-4.2 4.2 0 .3 0 .7.1 1C8.1 8.9 5.1 7.3 3 4.8c-.4.6-.6 1.3-.6 2.1 0 1.5.7 2.8 1.9 3.5-.7 0-1.3-.2-1.9-.5v.1c0 2 1.5 3.7 3.4 4.1-.4.1-.7.2-1.1.2-.3 0-.5 0-.8-.1.5 1.6 2 2.8 3.9 2.9-1.4 1.1-3.2 1.8-5.2 1.8-.3 0-.7 0-1-.1 1.9 1.2 4 1.9 6.3 1.9 7.5 0 11.6-6.2 11.6-11.6v-.5c.8-.5 1.5-1.2 2-2z"/></svg></a>
          <a href="https://www.linkedin.com/company/platinum-construction-corporation" aria-label="LinkedIn"><svg viewBox="0 0 24 24"><path d="M20.5 2h-17C2.7 2 2 2.7 2 3.5v17c0 .8.7 1.5 1.5 1.5h17c.8 0 1.5-.7 1.5-1.5v-17c0-.8-.7-1.5-1.5-1.5zM8 18.5H5V10h3v8.5zM6.5 8.3c-1 0-1.7-.8-1.7-1.7S5.5 5 6.5 5s1.7.8 1.7 1.7-.8 1.6-1.7 1.6zM19 18.5h-3v-4.4c0-1.1 0-2.4-1.5-2.4s-1.7 1.2-1.7 2.4v4.5h-3V10h2.9v1.3c.4-.8 1.4-1.5 2.8-1.5 3 0 3.5 2 3.5 4.5v4.2z"/></svg></a>
        </div>
      </div>
      <div class="footer-col">
        <h4>Navigate</h4>
        <ul>
          <li><a href="/index.html">Home</a></li>
          <li><a href="/about.html">About</a></li>
          <li><a href="/services.html">Services</a></li>
          <li><a href="/gallery.html">Gallery</a></li>
          <li><a href="/virtual-tours.html">Virtual Tours</a></li>
          <li><a href="/environmental-policy.html">Environmental Policy</a></li>
          <li><a href="/blog.html">Blog</a></li>
          <li><a href="/contact.html">Contact</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>Services</h4>
        <ul>
          <li><a href="/services.html">Commercial Construction</a></li>
          <li><a href="/services.html">Franchise Rollouts</a></li>
          <li><a href="/services.html">Hotel Turnkey</a></li>
          <li><a href="/services.html">Salon Studios</a></li>
          <li><a href="/services.html">Commercial Kitchens</a></li>
          <li><a href="/services.html">Custom Homes</a></li>
        </ul>
      </div>
      <div class="footer-col footer-contact">
        <h4>Contact</h4>
        <p><strong>Canada</strong>83 Citation Dr. Unit 2<br />Vaughan, ON L4K 2Z6<br /><a href="tel:9057638119">905-763-8119</a></p><p><strong>United States</strong>1441 Broadway, Suite 6075<br />New York, NY 10018<br /><a href="tel:18557638119">1-855-763-8119</a></p>
        <p><strong>Email</strong><a href="mailto:info&#64;platinumconstruction&#46;com">info&#64;platinumconstruction&#46;com</a></p>
      </div>
    </div>
    <div class="footer-bottom">
      <div>&copy; <span data-year>2026</span> Platinum Construction Corporation. All rights reserved.</div>
      <div>Building excellence since 1997.</div>
    </div>
  </div>
</footer>
```

- [ ] **Step 2: Create `src/sitemap.njk` for auto-generated sitemap**

```njk
---
permalink: /sitemap.xml
eleventyExcludeFromCollections: true
---
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  {%- set staticPages = [
    { loc: '/', priority: '1.0', changefreq: 'monthly' },
    { loc: '/about', priority: '0.8', changefreq: 'monthly' },
    { loc: '/services', priority: '0.9', changefreq: 'monthly' },
    { loc: '/gallery', priority: '0.9', changefreq: 'monthly' },
    { loc: '/virtual-tours', priority: '0.8', changefreq: 'monthly' },
    { loc: '/environmental-policy', priority: '0.5', changefreq: 'yearly' },
    { loc: '/contact', priority: '0.7', changefreq: 'yearly' },
    { loc: '/blog', priority: '0.7', changefreq: 'weekly' }
  ] -%}
  {%- for p in staticPages -%}
  <url>
    <loc>https://platinum-site.vercel.app{{ p.loc }}</loc>
    <changefreq>{{ p.changefreq }}</changefreq>
    <priority>{{ p.priority }}</priority>
  </url>
  {%- endfor -%}
  {%- for article in collections.articles -%}
  <url>
    <loc>https://platinum-site.vercel.app/blog/{{ article.fileSlug }}</loc>
    <lastmod>{{ article.data.date | dateISO }}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  {%- endfor -%}
</urlset>
```

- [ ] **Step 3: Delete the root `sitemap.xml`**

```bash
git rm sitemap.xml
```

- [ ] **Step 4: Build and verify**

```bash
npm run build
```

Verify:
- `_site/blog.html` exists and lists the 1 article card
- `_site/sitemap.xml` exists with all 9 URLs (8 static + 1 article), valid XML

```bash
cat _site/sitemap.xml
```

Open `http://localhost:8080/blog` — visual parity vs current production blog index.

- [ ] **Step 5: Commit**

```bash
git add blog.html src/sitemap.njk
git commit -m "Convert blog index to Eleventy + auto-generate sitemap from collections"
```

---

### Task 11b: Phase 2 acceptance gate — full visual parity check

**Files:** none (manual verification)

**Why:** Same idea as Task 5, but now after templating. Catch any regression introduced by the migration.

- [ ] **Step 1: Build clean**

```bash
npm run clean && npm run build
```

- [ ] **Step 2: Visual diff each page against production**

For each of the 9 URLs (`/`, `/about`, `/services`, `/gallery`, `/virtual-tours`, `/environmental-policy`, `/contact`, `/blog`, `/blog/building-out-commercial-space-ontario`):

1. Open the local URL in one browser tab
2. Open `https://platinum-site.vercel.app/<same-path>` in another
3. Toggle DevTools, check no missing assets
4. Side-by-side compare visually
5. View source: confirm `<title>`, meta description, og:image, JSON-LD all present and correct

If any difference, fix before phase 3.

- [ ] **Step 3: Push to `decap-migration` branch and verify Vercel preview**

```bash
git push
```

Open the Vercel preview URL for the branch. Re-run the same visual diff against prod. The build on Vercel must produce the same `_site/` as local.

---

## Phase 3 — Decap admin + OAuth

### Task 12: Create `admin/index.html` + `admin/config.yml`

**Files:**
- Create: `admin/index.html`
- Create: `admin/config.yml`

**Why:** This is the Decap CMS entry point. Visiting `/admin` loads the Decap UI from a CDN; `config.yml` defines what the SEO team can edit.

- [ ] **Step 1: Create `admin/index.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="robots" content="noindex" />
  <title>Platinum CMS — Admin</title>
  <link rel="icon" type="image/png" href="/favicon-32x32.png" />
</head>
<body>
  <script src="https://unpkg.com/decap-cms@^3.5.0/dist/decap-cms.js"></script>
</body>
</html>
```

- [ ] **Step 2: Create `admin/config.yml`**

```yaml
backend:
  name: github
  repo: zifojobs/platinum
  branch: main
  base_url: https://platinum-site.vercel.app
  auth_endpoint: api/auth

publish_mode: editorial_workflow

media_folder: blog/uploads
public_folder: /blog/uploads

site_url: https://platinum-site.vercel.app
display_url: https://platinum-site.vercel.app
logo_url: https://platinum-site.vercel.app/canada-logo.png

collections:
  - name: posts
    label: "Articles"
    label_singular: "Article"
    folder: content/blog
    create: true
    delete: true
    extension: md
    format: frontmatter
    slug: "{{slug}}"
    summary: "{{title}} — {{category}} ({{date | date('YYYY-MM-DD')}})"
    sortable_fields: ['date', 'title']
    fields:
      - { label: "Title", name: "title", widget: "string", required: true }
      - { label: "Date", name: "date", widget: "datetime", required: true, format: "YYYY-MM-DD", date_format: true, time_format: false, picker_utc: false }
      - label: "Category"
        name: "category"
        widget: "select"
        required: true
        options: ["Build-Out Guide", "Case Study", "Industry Insights"]
      - { label: "Lead (one-sentence summary)", name: "lead", widget: "text", required: true, hint: "Shown under the title and as the meta description fallback. Keep under 160 characters." }
      - { label: "Cover image", name: "cover", widget: "image", required: true, hint: "Recommended: 1200×675 JPG/WebP, < 300KB." }
      - label: "SEO overrides (optional)"
        name: "seo"
        widget: "object"
        required: false
        fields:
          - { label: "SEO title", name: "title", widget: "string", required: false, hint: "Defaults to the article title + ' | Platinum Construction'" }
          - { label: "SEO description", name: "description", widget: "text", required: false, hint: "Defaults to the lead. 140-160 characters ideal." }
          - { label: "OG image", name: "ogImage", widget: "image", required: false, hint: "Defaults to the cover image." }
      - { label: "Body", name: "body", widget: "markdown", required: true }

  - name: pageSeo
    label: "Pages SEO"
    label_singular: "Page"
    files:
      - label: "Home"
        name: "home"
        file: "_data/pages/home.json"
        fields: &seoFields
          - { label: "Title", name: "title", widget: "string", required: true, hint: "Browser tab + SERP. 50-60 chars ideal." }
          - { label: "Meta description", name: "description", widget: "text", required: true, hint: "140-160 chars. Pitch why someone should click." }
          - { label: "OG image", name: "ogImage", widget: "string", required: true, hint: "Path starting with /, e.g. /og-image.jpg" }
      - { label: "About", name: "about", file: "_data/pages/about.json", fields: *seoFields }
      - { label: "Services", name: "services", file: "_data/pages/services.json", fields: *seoFields }
      - { label: "Gallery", name: "gallery", file: "_data/pages/gallery.json", fields: *seoFields }
      - { label: "Virtual Tours", name: "virtual-tours", file: "_data/pages/virtual-tours.json", fields: *seoFields }
      - { label: "Environmental Policy", name: "environmental-policy", file: "_data/pages/environmental-policy.json", fields: *seoFields }
      - { label: "Contact", name: "contact", file: "_data/pages/contact.json", fields: *seoFields }
      - { label: "Blog index", name: "blog", file: "_data/pages/blog.json", fields: *seoFields }
```

Notes:
- `format: frontmatter` matches our `.md` front-matter pattern.
- `slug: "{{slug}}"` makes the file name = the slug (URL).
- `media_folder` = where Decap uploads images. `public_folder` = the path used in markdown when referencing the image.
- The YAML anchor `&seoFields` and reference `*seoFields` is a YAML feature that lets us define the field shape once for all 7 SEO files.

- [ ] **Step 3: Build and verify the files are passed through**

```bash
npm run build
ls _site/admin/
```

Expected: `_site/admin/index.html` and `_site/admin/config.yml` are present.

```bash
curl -sI http://localhost:8080/admin/config.yml | head -3
```

(After `npm run start`.) Expected: `200 OK` and `Content-Type: text/yaml` (or `application/octet-stream`, both are acceptable).

- [ ] **Step 4: Verify the admin loads (will fail to login — expected)**

Open `http://localhost:8080/admin/`. The Decap UI should appear with a "Login with GitHub" button. Clicking it will fail because the OAuth proxy isn't built yet. That's expected — we wire it up in the next task.

- [ ] **Step 5: Commit**

```bash
git add admin/
git commit -m "Add Decap CMS admin entry + config (Posts + Pages SEO collections)"
```

---

### Task 13: Implement OAuth proxy on Vercel functions

**Files:**
- Create: `api/auth.js`
- Create: `api/callback.js`
- Modify: `package.json` (add `cookie` dep)

**Why:** Decap CMS's GitHub backend requires an OAuth proxy to exchange the authorization code for an access token. Without it, the SEO team can't log in.

The strategy is to start from a small reference implementation rather than writing from scratch. The well-known pattern uses two endpoints. The code below is adapted from the maintained `decap-cms-vercel-oauth` reference.

- [ ] **Step 1: Add `cookie` package for state cookie handling**

```bash
npm install cookie@^0.6.0
```

This updates `package.json` and `package-lock.json`.

- [ ] **Step 2: Create `api/auth.js`**

```js
import { serialize } from "cookie";
import crypto from "crypto";

export default function handler(req, res) {
  const clientId = process.env.OAUTH_CLIENT_ID;
  if (!clientId) {
    res.status(500).send("OAUTH_CLIENT_ID env var is missing.");
    return;
  }

  // Random state for CSRF protection
  const state = crypto.randomBytes(16).toString("hex");

  // Set a short-lived signed-ish cookie. We store the state and validate on callback.
  res.setHeader(
    "Set-Cookie",
    serialize("oauth_state", state, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 600 // 10 minutes
    })
  );

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: "https://platinum-site.vercel.app/api/callback",
    scope: "repo,user",
    state
  });

  res.writeHead(302, {
    Location: `https://github.com/login/oauth/authorize?${params.toString()}`
  });
  res.end();
}
```

- [ ] **Step 3: Create `api/callback.js`**

```js
import { parse } from "cookie";

export default async function handler(req, res) {
  const { code, state } = req.query;
  const cookies = parse(req.headers.cookie || "");
  const expectedState = cookies.oauth_state;

  if (!code || !state || state !== expectedState) {
    res.status(400).send("Invalid OAuth state.");
    return;
  }

  const clientId = process.env.OAUTH_CLIENT_ID;
  const clientSecret = process.env.OAUTH_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    res.status(500).send("OAuth env vars missing on the server.");
    return;
  }

  // Exchange code for token
  const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: "https://platinum-site.vercel.app/api/callback"
    })
  });

  const tokenJson = await tokenRes.json();
  if (!tokenJson.access_token) {
    res.status(500).send(`OAuth token exchange failed: ${JSON.stringify(tokenJson)}`);
    return;
  }

  const payload = {
    token: tokenJson.access_token,
    provider: "github"
  };

  // Decap expects a postMessage to the opener window in this exact format.
  const html = `<!DOCTYPE html>
<html><body>
<script>
(function() {
  function send(msg) {
    if (window.opener) window.opener.postMessage(msg, "*");
  }
  send("authorization:github:success:" + ${JSON.stringify(JSON.stringify(payload))});
  setTimeout(function(){ window.close(); }, 100);
})();
</script>
<p>Authentication successful. You can close this window.</p>
</body></html>`;

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.status(200).send(html);
}
```

- [ ] **Step 4: Set Vercel env vars [OOB — user action required]**

The user (Saïbo) must perform this manually in the Vercel dashboard:

1. Go to https://vercel.com/dashboard → select the platinum project
2. Settings → Environment Variables
3. Add variable `OAUTH_CLIENT_ID` with value `Ov23liukZ0UrrFAuwi8a` (Production, Preview, Development — all three checked)
4. Add variable `OAUTH_CLIENT_SECRET` with the value of the GitHub OAuth App secret (held by the user only — DO NOT paste here or commit)
5. Save. The next deployment picks up the vars.

This step blocks login but does NOT block subsequent code tasks. Continue and verify after Vercel redeploys.

- [ ] **Step 5: Update GitHub OAuth App callback URL [OOB — user action required]**

In https://github.com/settings/developers → OAuth Apps → "Platinum CMS" → set:
- Homepage URL: `https://platinum-site.vercel.app`
- Authorization callback URL: `https://platinum-site.vercel.app/api/callback`

Save.

- [ ] **Step 6: Commit**

```bash
git add api/ package.json package-lock.json
git commit -m "Add OAuth proxy for Decap CMS (Vercel serverless functions)"
```

- [ ] **Step 7: Push and test on Vercel preview deploy**

```bash
git push
```

Wait for Vercel to redeploy the `decap-migration` branch. Open `https://<preview-url>/admin/`. Click "Login with GitHub". Expected:
1. Redirect to GitHub authorization
2. Approve the OAuth App
3. Redirect back to `/api/callback`
4. Window closes, Decap UI shows the SEO team member is logged in
5. The "Articles" and "Pages SEO" collections are visible

If login fails:
- Check the Vercel function logs (`vercel logs` or via dashboard) for errors
- Common cause: env vars not set on the preview environment specifically
- Common cause: callback URL mismatch in GitHub OAuth App
- If still blocked after 30 min of debugging, fall back to Q9 plan C (Netlify Identity) — see spec

---

### Task 14: Configure GitHub branch protection [OOB — user action]

**Files:** none (GitHub UI configuration)

**Why:** With Editorial Workflow, Decap creates draft branches and merges them on publish. We protect `main` against accidental force-pushes and direct deletes, while still allowing Decap (acting as the user via OAuth token) to merge programmatically.

- [ ] **Step 1: Open repo settings**

Go to https://github.com/zifojobs/platinum/settings/branches.

- [ ] **Step 2: Add a branch protection rule for `main`**

Click "Add classic branch protection rule" (or equivalent in the new ruleset UI). Pattern: `main`.

Settings:
- ✅ Restrict deletions
- ❌ Require a pull request before merging — **OFF** (Decap needs to merge programmatically; turning this on breaks the publish flow)
- ❌ Require status checks to pass before merging — OFF (no CI checks defined yet; turning this on would block Decap)
- ❌ Allow force pushes — OFF
- ✅ Do not allow bypassing the above settings (or include user "Saïbo" as a bypass — your call)

Save the rule.

- [ ] **Step 3: Verify**

Try `git push --force origin main` from your local machine. Expected: rejected.
Try a normal `git push origin main`. Expected: succeeds.

This is OOB; no commit needed.

---

## Phase 4 — Verification + documentation

### Task 15: End-to-end test on Vercel preview

**Files:** none (manual end-to-end testing)

**Why:** Before merging `decap-migration` into `main`, prove the entire flow works under realistic conditions on Vercel.

- [ ] **Step 1: Confirm Vercel preview is up to date**

```bash
git push
```

Wait for Vercel to redeploy `decap-migration`. Note the preview URL.

- [ ] **Step 2: Login to admin**

Open `https://<preview-url>/admin/`. Click "Login with GitHub". Authorize. Expected: lands in Decap UI.

- [ ] **Step 3: Create a test article**

Click "Articles" → "New Article". Fill in:
- Title: `Test Article — DELETE ME`
- Date: today
- Category: Industry Insights
- Lead: "This is a test article to verify the editorial workflow."
- Cover image: upload any small JPG (test that upload works)
- Body: `# Test\n\nThis is a test paragraph.`

Click "Save". Expected:
- A draft branch appears in https://github.com/zifojobs/platinum/branches
- A PR is auto-opened by Decap
- Vercel deploys the PR → preview URL for the draft

- [ ] **Step 4: Verify the draft preview**

Open the draft PR's Vercel preview URL. Navigate to `/blog`. Expected: the test article appears in the index. Click → article renders correctly.

- [ ] **Step 5: Publish from Decap**

Back in Decap, change status to "Ready", then click "Publish now". Expected:
- The PR merges into `main` (visible in GitHub)
- Vercel rebuilds prod
- Within 30s, `https://platinum-site.vercel.app/blog/test-article-delete-me` is live

- [ ] **Step 6: Delete the test article**

Back in Decap, open the test article, click "Delete". Confirm. Expected: another draft PR is created. Move it to "Ready" and publish. The article is removed from the live site.

- [ ] **Step 7: Edit per-page SEO meta**

In Decap, go to "Pages SEO" → "About". Change the description to something distinguishable (e.g., add " [TEST]" at the end). Save → publish. Verify the change reaches `https://platinum-site.vercel.app/about` (view source, look for the modified description). Then revert it (edit again, remove the " [TEST]" suffix, publish).

- [ ] **Step 8: Document any issues found**

If anything breaks during this test, fix and re-test. Do not move on with broken Decap.

---

### Task 16: Update `CLAUDE.md` and `README.md`

**Files:**
- Modify: `CLAUDE.md`
- Modify: `README.md`

**Why:** The dev workflow has changed (npm-based instead of live-server). New maintainers (or future-you) need to know how to build and run the site, where the CMS lives, and how the SEO team workflow operates.

- [ ] **Step 1: Update `CLAUDE.md`**

Read the existing `CLAUDE.md`. Add a new section after "Stack & Structure" called "Build pipeline":

```markdown
## Build pipeline

The site is now built with Eleventy (added 2026-05-04). All content lives in source form; `_site/` is the build output (gitignored).

- `npm install` — one-time setup
- `npm run start` — Eleventy dev server with live reload on port 8080
- `npm run build` — production build to `_site/`
- `npm run clean` — wipe `_site/`

Vercel is configured (`vercel.json`) to run `npm run build` and serve `_site/`.

### Source layout

- `content/blog/<slug>.md` — articles, written in markdown by the SEO team via Decap CMS
- `_data/pages/<page>.json` — per-page SEO metadata for the 7 corporate pages
- `src/_includes/layouts/{base,article}.njk` — Nunjucks layouts
- `src/_includes/partials/head-seo.njk` — shared `<head>` block
- `src/sitemap.njk` — auto-generates `sitemap.xml` from collections
- `admin/` — Decap CMS entry point (`/admin` URL)
- `api/{auth,callback}.js` — Vercel serverless functions for the GitHub OAuth proxy

### CMS workflow (SEO team)

The client's SEO team has admin access at `/admin`. They use Editorial Workflow:
- Save = creates a draft branch + PR
- Vercel auto-deploys each PR (preview URL)
- "Publish now" in Decap = merges PR into `main` = live in ~30s

See `docs/superpowers/specs/2026-05-04-decap-cms-on-vercel-design.md` for the full architecture and decision rationale.
```

- [ ] **Step 2: Update `README.md`**

Replace whatever currently exists (or create if missing) with:

```markdown
# Platinum Construction Corporation — Website

Static site for Platinum Construction Corporation, built with [Eleventy](https://www.11ty.dev/) and deployed to Vercel.

The client's SEO team can publish articles and edit per-page SEO meta via [Decap CMS](https://decapcms.org/) at `/admin`.

## Local development

Requirements: Node 20+

```bash
npm install
npm run start     # Eleventy dev server on http://localhost:8080
npm run build     # production build to _site/
```

## Deployment

Pushes to `main` trigger a Vercel build. The Vercel project is configured (`vercel.json`) to run `npm run build` and serve `_site/`.

## Adding a new article

Two paths:

1. **SEO team / non-developers:** Use the Decap CMS admin at `https://platinum-site.vercel.app/admin/`. Login with GitHub.
2. **Developers:** Create `content/blog/<slug>.md` with the front-matter shape from existing articles. Push.

## Architecture & decisions

See `docs/superpowers/specs/2026-05-04-decap-cms-on-vercel-design.md`.
```

- [ ] **Step 3: Commit**

```bash
git add CLAUDE.md README.md
git commit -m "Update CLAUDE.md + README.md for Eleventy/Decap workflow"
```

---

### Task 17: Merge `decap-migration` into `main` and verify production

**Files:** none (git/Vercel actions)

**Why:** Final integration step. After this, the site is officially running on Eleventy + Decap.

- [ ] **Step 1: Final review of the diff**

```bash
git fetch origin main
git diff origin/main...HEAD --stat
```

Sanity-check the file list. Anything unexpected? Investigate before merging.

- [ ] **Step 2: Open a PR (or fast-forward merge if you prefer)**

Option A — PR for self-review:

```bash
gh pr create --title "Migrate to Eleventy + Decap CMS" --body "$(cat <<'EOF'
## Summary
- Eleventy 3 build with passthrough copy of all existing static assets
- Article migrated to markdown + auto-generated blog index and sitemap
- Decap CMS at /admin for SEO team self-service publishing
- OAuth proxy on Vercel functions
- Per-page SEO meta extracted to _data/pages/*.json (editable via Decap)

## Test plan
- [ ] Vercel preview deploy renders all 9 URLs identically to current prod
- [ ] /admin login succeeds with a SEO team test account
- [ ] Test article round-trip (create draft → preview → publish → delete) succeeds

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

Option B — fast-forward merge (if confident):

```bash
git checkout main
git merge --ff-only decap-migration
git push origin main
```

- [ ] **Step 3: Wait for Vercel prod deploy**

Watch the Vercel dashboard. The build should complete in ~1-2 minutes.

- [ ] **Step 4: Production smoke test**

Open `https://platinum-site.vercel.app/`. Click through every page. Confirm:
- All visual rendering correct
- `/blog/building-out-commercial-space-ontario` works
- `/sitemap.xml` lists all URLs
- `/admin/` loads (the SEO team can now log in)

- [ ] **Step 5: Notify the SEO team**

Send the team the admin URL + the 1-page how-to (separate document, prepared after this milestone).

---

## Out-of-band actions summary [OOB]

These are tasks the assistant cannot perform — collected here for the user's reference:

| When | Action |
|---|---|
| Before Task 13 | Set Vercel env vars `OAUTH_CLIENT_ID`, `OAUTH_CLIENT_SECRET` |
| Before Task 13 | Verify GitHub OAuth App callback URL is `https://platinum-site.vercel.app/api/callback` |
| Task 14 | Configure branch protection on `main` |
| After Task 17 | Invite SEO team members as `Write` collaborators (collect their GitHub usernames first) |
| After Task 17 | Send SEO team the admin URL + 1-page onboarding doc |

## Acceptance criteria (from spec, recap)

- [ ] `npm install`, `npm run build`, `npm run start` all succeed
- [ ] All 9 production URLs render identically to pre-migration prod
- [ ] `sitemap.xml` auto-generated and includes all URLs
- [ ] `/admin` loads and a test SEO account can complete the full editorial workflow
- [ ] Branch protection on `main` configured per spec
- [ ] `CLAUDE.md` and `README.md` updated
