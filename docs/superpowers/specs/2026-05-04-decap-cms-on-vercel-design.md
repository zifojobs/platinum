# Decap CMS on Vercel + Eleventy — Design Spec

**Date**: 2026-05-04
**Project**: Platinum Construction Corporation website
**Goal**: Give the client's SEO team autonomy to publish blog articles and tweak per-page SEO metadata, without porting to WordPress, while preserving the current Vercel + static-HTML setup, design fidelity, and performance.
**Estimated effort**: 1-2 days end-to-end (build setup + content migration + OAuth + admin + testing)

## Decisions locked during brainstorming

Each decision was made deliberately during the brainstorming session of 2026-05-04. They are recorded here so that any future session inherits the same architectural ground truth.

| # | Question | Decision |
|---|---|---|
| Q1 | Build tool | **Eleventy 3.x** — lightweight JS SSG, no opinionated framework |
| Q2 | Build scope | **Whole site** — Eleventy processes everything, outputs to `_site/` |
| Q3 | Editorial workflow | **Drafts via PRs** — `publish_mode: editorial_workflow` in Decap |
| Q4 | Article body format | **Markdown only** (Decap rich-text editor); CTA card hardcoded in template |
| Q5 | Categories | **Hardcoded enum**: Build-Out Guide, Case Study, Industry Insights |
| Q6 | Cover image | **Single field** `cover`, used for card / hero / og:image / JSON-LD; recommended upload 1200×675 |
| Q7 | Reading time | **Auto-computed at build** (~200 wpm filter) |
| Q8 | Image upload location | **In repo** at `blog/uploads/<filename>`, committed via Decap |
| Q9 | OAuth proxy | **Self-hosted on Vercel functions** (`api/auth.js` + `api/callback.js`), starting from a maintained reference implementation; fallback C (Netlify Identity) if blocked |
| Q10 | Admin scope | **Articles + per-page SEO meta** for the 7 corporate pages (title / description / og:image only); body content of corporate pages remains hardcoded HTML |
| Q11 | User provisioning | **Direct GitHub collaborators** with Write role + branch protection on `main` |
| Q12 | Sitemap | **Auto-generated** at build time via `src/sitemap.njk` |

## Non-goals (YAGNI)

- No templating of the corporate pages' body content (about, services, etc. remain hand-edited HTML by the dev)
- No image optimization pipeline (`@11ty/eleventy-img`)
- No tags, free-text categories, comments, or RSS feed
- No localization (site is English only)
- No editor-defined Decap blocks beyond standard markdown
- No port to WordPress (this is the alternative we are deliberately avoiding)
- No auto-deploy of preview branches outside Vercel's native PR previews

## Architecture

### Repo layout after migration

```
.
├── .eleventy.js                    ← Eleventy config (filters, collections, passthrough)
├── package.json                    ← npm scripts + deps (@11ty/eleventy, markdown-it)
├── package-lock.json
├── vercel.json                     ← updated: buildCommand, outputDirectory: "_site"
├── .gitignore                      ← + node_modules/, _site/
│
├── admin/
│   ├── index.html                  ← Decap CMS entry (loads decap-cms.js from CDN)
│   └── config.yml                  ← Collections, fields, backend config
│
├── api/                            ← Vercel serverless functions (Node 20)
│   ├── auth.js                     ← Step 1: redirect to GitHub OAuth
│   └── callback.js                 ← Step 2: exchange code for token, postMessage to Decap
│
├── content/
│   └── blog/
│       └── building-out-commercial-space-ontario.md   ← migrated article
│
├── _data/
│   └── seo/                        ← per-page SEO metadata (Decap "Files" collection)
│       ├── home.json
│       ├── about.json
│       ├── services.json
│       ├── gallery.json
│       ├── virtual-tours.json
│       ├── environmental-policy.json
│       └── contact.json
│
├── src/                            ← Eleventy templates / includes
│   ├── _includes/
│   │   ├── layouts/
│   │   │   ├── base.njk            ← shared <head>, header, footer scaffolding
│   │   │   └── article.njk         ← extends base; article-specific structure + CTA
│   │   └── partials/
│   │       ├── head-seo.njk        ← reusable <title>, meta, OG, Twitter, JSON-LD
│   │       ├── header.njk          ← shared horizontal nav (existing markup)
│   │       └── footer.njk          ← shared rich footer
│   ├── blog.njk                    ← blog index page (lists all articles via collection)
│   └── sitemap.njk                 ← auto-generated sitemap.xml
│
├── blog/
│   └── uploads/                    ← images uploaded by Decap (committed)
│       └── .gitkeep
│
├── assets/css/main.css             ← unchanged
├── assets/js/                      ← unchanged
├── projects/                       ← unchanged (gallery photos)
│
├── index.html                      ← unchanged (passthrough copy by Eleventy)
├── about.html                      ← will become Eleventy template referencing _data/seo/about.json
├── services.html                   ← idem
├── gallery.html                    ← idem
├── virtual-tours.html              ← idem
├── environmental-policy.html       ← idem
├── contact.html                    ← idem
└── (existing static assets at root: logos, favicons, og-image.jpg, etc.)
```

### Build output

`npm run build` (which Vercel runs) executes Eleventy. Output goes to `_site/` with this structure:

```
_site/
├── index.html                      (passthrough or templated)
├── about.html, services.html, ...  (with injected SEO meta from _data/seo/*.json)
├── blog.html                       (auto-listed articles)
├── blog/
│   ├── building-out-commercial-space-ontario.html  (flat .html, mirrors current URL structure with Vercel cleanUrls)
│   └── uploads/...                 (passthrough copy)
├── admin/
│   ├── index.html
│   └── config.yml                  (passthrough — must remain accessible at /admin/config.yml)
├── assets/                         (passthrough)
├── projects/                       (passthrough)
├── sitemap.xml                     (generated)
└── (favicons, logos, robots.txt, llms.txt, og-image.jpg — passthrough)
```

`vercel.json` is updated with `"buildCommand": "npm run build"` and `"outputDirectory": "_site"`. The existing headers/cleanUrls config is preserved.

## Data model

### Article (markdown file in `content/blog/`)

Front-matter (YAML), body (markdown):

```yaml
---
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
[markdown body — paragraphs, ## h2, ### h3, lists, tables, **strong**, *em*, [links](url)]
```

The `slug` is derived from the filename (`building-out-commercial-space-ontario.md` → URL `/blog/building-out-commercial-space-ontario`). No need to store it in front-matter.

The `readingTime` is computed at build time from the body word count (no field).

The `seo.ogImage` defaults to `cover` if absent (template logic).

### Per-page SEO metadata (JSON file in `_data/seo/`)

```json
{
  "title": "About Us | Platinum Construction in Ontario, Canada",
  "description": "Founded in 1997, Platinum Construction is an Ontario general contractor delivering commercial, hospitality and custom builds across Canada and the US.",
  "ogImage": "/og-image.jpg"
}
```

The corresponding HTML page (`about.html`) becomes a thin Eleventy template that references this data via `seo.about.title` etc. The body content of the page is not affected — it remains hand-coded HTML.

### Decap CMS configuration (`admin/config.yml`)

Two collections:

1. **Posts** — `content/blog/*.md` files, full CRUD, editorial workflow enabled
   - Fields: title (string), date (datetime), category (select with 3 options), lead (text), cover (image), seo.title (string), seo.description (text), seo.ogImage (image, optional), body (markdown)
   - `media_folder: "blog/uploads"`, `public_folder: "/blog/uploads"`
   - Filename pattern: `content/blog/{{slug}}.md`

2. **SEO Pages** (`type: files`) — fixed entries, edit-only
   - One file per corporate page, mapped to `_data/seo/<page>.json`
   - Fields: title (string), description (text), ogImage (image)

The CMS backend is `github` with `repo: zifojobs/platinum`, `branch: main`, `base_url: https://platinum-site.vercel.app`, `auth_endpoint: api/auth`. `publish_mode: editorial_workflow` enables the draft/review/publish flow.

## OAuth proxy (`api/auth.js` + `api/callback.js`)

Two Vercel serverless functions, Node 20 runtime.

### `api/auth.js`

1. Reads `OAUTH_CLIENT_ID` from env.
2. Generates a random state token (CSRF protection), stores it in a short-lived signed cookie.
3. Redirects the browser to `https://github.com/login/oauth/authorize?client_id=...&redirect_uri=https://platinum-site.vercel.app/api/callback&scope=repo&state=...`.

### `api/callback.js`

1. Reads `OAUTH_CLIENT_ID` and `OAUTH_CLIENT_SECRET` from env.
2. Validates the `state` query param against the cookie (rejects if mismatch).
3. POSTs to `https://github.com/login/oauth/access_token` with `client_id`, `client_secret`, `code` to exchange the authorization code for an access token.
4. Returns an HTML page that calls `window.opener.postMessage('authorization:github:success:{"token":"<access_token>","provider":"github"}', "*")` and closes the popup.

This is the standard Decap external-OAuth flow. Reference implementations are available — the plan will start from a maintained one rather than writing from scratch.

### Environment variables (set in Vercel project settings)

| Variable | Where | Notes |
|---|---|---|
| `OAUTH_CLIENT_ID` | Vercel | Public, value: `Ov23liukZ0UrrFAuwi8a` |
| `OAUTH_CLIENT_SECRET` | Vercel | Held only by user (Saïbo); never committed; never sent to assistant |

## Build pipeline

### `package.json` scripts

```json
{
  "scripts": {
    "start": "eleventy --serve",
    "build": "eleventy",
    "clean": "rimraf _site"
  }
}
```

### `.eleventy.js` essentials

- Input dir: project root
- Output dir: `_site`
- Includes dir: `src/_includes`
- Data dir: `_data`
- Passthrough copy: `assets`, `projects`, `videos`, `blog/uploads`, `admin`, all root-level binary assets (logos, favicons, og-image.jpg, hero videos, robots.txt, llms.txt)
- Custom filter: `readingTime(text)` returns `Math.max(1, round(wordCount(text) / 200))`
- Custom filter: `formatDate(date, fmt)` for human-readable display dates
- Custom collection: `articles` = all `.md` files under `content/blog/`, sorted by `date` desc

### Eleventy template strategy for the 7 corporate pages

Each existing HTML page is renamed to keep its same output URL but is converted into an Eleventy template that:
1. Sets a `permalink` matching its current URL (so `/about` keeps the same URL Vercel serves)
2. References `seo[pageKey]` from `_data/seo/<page>.json` for the head tags
3. Keeps the body content hand-coded, just like today, but inside the template scope

Implementation: keep the existing `.html` filenames and add an Eleventy YAML front-matter block at the top of each. Eleventy supports this natively; the body of the page after the front-matter remains the same HTML, ensuring the visual diff with production is zero.

Example for `about.html`:

```html
---
layout: layouts/base.njk
permalink: /about/index.html
pageKey: about
---
{# Eleventy will inject layout's <head> with seo.about meta, then render the body content below #}
<section class="page-hero">
  ... existing markup ...
</section>
... rest of the page unchanged ...
```

The `base.njk` layout pulls in `partials/head-seo.njk` which reads `seo[pageKey]` from `_data/seo/<pageKey>.json`.

This is a "thin templatization" — the body content is preserved verbatim, only the head and outer scaffolding go through Eleventy. The risk of regression is bounded.

## Editorial workflow (Q3 / Decap publish_mode: editorial_workflow)

When the SEO team saves an article:

1. Decap creates (or updates) a branch `cms/posts/<slug>` and opens a PR against `main` if not already open.
2. Vercel auto-deploys the PR → preview URL `https://platinum-<sha>.vercel.app/blog/<slug>`.
3. The article shows in Decap's "Workflow" view as **Drafts** → moveable to **In Review** → **Ready**.
4. When the editor clicks **Publish now**, Decap merges the PR into `main`. Vercel rebuilds prod. Article live in ~30s.

For per-page SEO meta edits, same flow applies — each save is a small commit on a draft branch.

## Migration of the existing article

A one-time conversion from HTML to markdown:

1. Move `blog/building-out-commercial-space-ontario.html` body content into a new `content/blog/building-out-commercial-space-ontario.md` file.
2. Convert HTML body tags to markdown:
   - `<h2>` → `## `, `<h3>` → `### `
   - `<p>` → blank line + text
   - `<ul><li>` → `- `, `<ol><li>` → `1. `
   - `<strong>` → `**`, `<em>` → `*`
   - `<a href="X">Y</a>` → `[Y](X)`
   - `<table>` → markdown table syntax
3. Copy `image_5.jpg` from the project folder to `blog/uploads/building-out-cover.jpg`. The article front-matter references the new path (`/blog/uploads/building-out-cover.jpg`). The original copy in `projects/...` stays in place (gallery still uses it).
4. Set front-matter from the existing meta tags.
5. Delete `blog/building-out-commercial-space-ontario.html` (the build will regenerate the same output URL).

The output URL is preserved (`/blog/building-out-commercial-space-ontario`), so SEO and any external links are untouched.

## GitHub repo configuration

### Branch protection on `main`

- Require a pull request before merging: **disabled** (Decap needs to merge programmatically). Branch is still protected against force-push and deletion.
- Allow force pushes: **disabled**
- Allow deletions: **disabled**
- Bypass: include the user's own account so manual emergency commits are possible.

### Collaborators

Direct collaborators with **Write** role for each SEO team member. The user (Saïbo) collects their GitHub usernames out-of-band and adds them via Settings → Collaborators.

## Local development

After pull:

```bash
npm install            # one-time
npm run start          # Eleventy + live reload on http://localhost:8080
```

The previous `npx live-server --port=5500` workflow is replaced. `.vscode/launch.json` is updated to point at the Eleventy dev server.

## Acceptance criteria

The migration is considered done when ALL of the following pass:

1. **Build pipeline**
   - `npm install` succeeds locally on the user's machine
   - `npm run build` produces a `_site/` directory whose structure matches the current production site (every URL still resolves)
   - `npm run start` serves a working dev preview with live reload

2. **Migration parity**
   - `https://platinum-site.vercel.app/blog` renders the same magazine layout, with the article card linking correctly
   - `https://platinum-site.vercel.app/blog/building-out-commercial-space-ontario` renders the migrated article with identical visible output to the current HTML version (typography, CTA card, breadcrumb, JSON-LD)
   - All 7 corporate pages render identically (visual diff should be zero)
   - `sitemap.xml` lists all 9 URLs (7 corporate + blog index + 1 article)
   - `og-image.jpg` and per-page OG meta resolve correctly

3. **Decap admin**
   - Visiting `/admin` redirects through GitHub OAuth and lands in the Decap UI
   - User can create a test article (draft state), see it in the Workflow column
   - Vercel preview deploys for the draft PR (preview URL works)
   - Publishing the test article merges the PR and deploys to prod
   - Editing per-page SEO meta on, e.g., `about.html` updates `_data/seo/about.json`, propagates to the `<head>` after merge

4. **Permissions**
   - Branch protection on `main` is configured per spec
   - At least one test SEO team member account is added as `Write` collaborator
   - Test member can log in to `/admin`, create a draft, and publish

5. **Documentation**
   - `CLAUDE.md` updated with new dev workflow and architecture overview
   - `README.md` updated with `npm install` / `npm run start` instructions
   - A short note in `admin/config.yml` referencing this spec for future maintainers

## Risk register

| Risk | Likelihood | Mitigation |
|---|---|---|
| OAuth proxy fails on Vercel due to undocumented edge case | Medium | Start from maintained reference impl; test on preview deploy first; fallback to Netlify Identity (Q9 fallback C) |
| Eleventy passthrough misses a file → broken link in production | Medium | Implementation plan includes a post-build URL crawl checking that every URL from the current site still 200s |
| Markdown conversion of the existing article introduces a typo | Low | Visual diff between `_site/blog/.../index.html` and the live current article |
| SEO team member doesn't have a GitHub account | High (procedural) | User collects accounts before invite; sends them a 1-page "How to log in to /admin" guide |
| Domain switch happens mid-migration → OAuth callback URL breaks | Low | Already noted in `decap_oauth.md` memory; will need OAuth App update in GitHub Developer Settings if domain changes |

## Out-of-band actions required from the user (Saïbo) before implementation

These are the things the assistant cannot do — they require the user.

1. **Confirm `OAUTH_CLIENT_SECRET` is held safely** — NOT shared with assistant.
2. **Set Vercel env vars** : `OAUTH_CLIENT_ID` (= `Ov23liukZ0UrrFAuwi8a`) and `OAUTH_CLIENT_SECRET` (the secret).
3. **Configure branch protection** on `main` per spec section above.
4. **Collect GitHub usernames** of SEO team members, send invites with `Write` role.
5. **Verify the OAuth App callback URL** in GitHub Developer Settings is `https://platinum-site.vercel.app/api/callback`.
