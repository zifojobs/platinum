# Platinum Construction Corporation — Project Context

Context file for AI assistants working on this repo. Update this as the project evolves.

## Overview

- Client: **Platinum Construction Corporation** — commercial general contractor in Vaughan, ON, operating since 1997
- Old site: https://platinumconstruction.com/home/
- Repo: https://github.com/zifojobs/platinum.git (deployed to Vercel from `main`)
- Approach: static HTML/CSS/JS site is the **final deliverable** (WordPress + Elementor port was originally planned but is no longer on the table)
- Language: English only
- Design inspiration: Bauen Architecture ThemeForest template (fixed left sidebar layout)

## Stack & Structure

```
├── *.html                # 7 pages (index, about, services, gallery, virtual-tours, environmental-policy, contact)
├── logo.png / logo-dark.png  # Same image, two names (logo has dark bg baked in — silver wordmark + gold tagline)
├── Video.mp4             # Hero video (14 MB, 1916×1080)
├── Platinum_Final.mp4    # 27-years story video (44 MB)
├── virtualtours.jpeg     # Virtual Tours hero background (screenshot from legacy site)
├── assets/
│   ├── css/main.css      # Single stylesheet — design system + components + media queries
│   └── js/
│       ├── main.js              # Scroll, reveal, counters, lightbox, filter, parallax
│       ├── layout.js            # Injects socials + tagline + mobile close button into header/overlay
│       ├── projects-data.js     # PROJECTS catalog (21 folders w/ photos) + TOURS list (15 clients)
│       ├── gallery-render.js    # Renders gallery grid + lightbox preload
│       └── tours-render.js      # Renders the 15 virtual tour cards
└── projects/             # Photo folders per project (21 subfolders, image_0.jpg through image_N.jpg)
```

- Fonts: Oswald (display) + Inter (body) via Google Fonts CDN
- Local dev: `npx live-server --port=5500` (launch.json has this as default)

## Design system

**Colors extracted purely from logo:**
- **Dark navy** `--color-text-dark: #2d2d2d` (from "Construction Corporation" text) — headings, nav, primary text
- **Silver/grey** `--color-accent: #8c8c8c` (from "platinum" wordmark) — accents, highlights, button hover states
- **Light grey** `--color-light-grey: #dcdcdc` (from tagline) — secondary text, borders, dividers
- **White** `--color-light: #ffffff` (body background)
- **Subtle off-white** `--color-light-alt: #f9f9f9` (sidebar, minimal contrast backgrounds)

Premium, professional palette derived entirely from logo identity (dark navy, silver, light grey, white). No arbitrary colors.
- Typography: uppercase Oswald for headings/nav, Inter for body
- Transitions: `cubic-bezier(0.65, 0.05, 0.36, 1)` at 0.6s

## Layout rules

- Desktop: fixed left sidebar (280px), body has `padding-left: 280px`, logo + vertical nav + CTA + socials + tagline
- Mobile (`max-width: 1024px`): sidebar collapses to a slim top bar with logo + burger; overlay menu opens with a × close button. Critical bug fix: the burger used to be inside the transformed-off-screen header and unclickable — now the header stays in place and simply swaps layout.
- Mobile hero (`max-width: 768px`): `min-height: calc(100vh - 68px)` so the scroll indicator sits inside the viewport below the CTA buttons. Text centered. Video uses `object-fit: cover` to fill.

## Pages — state at time of writing

- **index** — Hero plays Video.mp4 (bottom gradient → black). 27-years section plays Platinum_Final.mp4 on a white backdrop. Stats, portfolio teaser, testimonial all on white/ivory.
- **about** — Philosophy + Stats sections moved from dark to ivory/`bg-light-alt`, text flipped to dark.
- **services** — Process section moved from dark to ivory/`bg-light-alt`.
- **gallery** — Cards redesigned: image on top, black title + location below (no overlay). Filter buttons dark text, active gold. `#` in folder paths now escaped as `%23` (Chipotle Markville thumbnail fix). Lightbox cycles through ALL images of the clicked project via hidden preload links.
- **virtual-tours** — Rewritten against the official 15-client list (not the PROJECTS catalog). Hero uses `virtualtours.jpeg`. Only `Sola Salons — Calgary` has a live Matterport URL (`https://my.matterport.com/show/?m=ZkpKZxawnHd`); the 14 others render with a grey "SOON" badge and alert on click.
- **environmental-policy, contact** — No dark sections, inherit body white.
- **Footer** — kept dark so the `logo-dark.png` (same file, dark bg) reads correctly. Client feedback was specifically about the sidebar and body sections, not the footer.

## Client feedback log

### Round 1 — `retour_client.docx`

- 🔴 Mobile menu fix — done
- 🟠 White as primary colour, harmonized with logo — done
- 🟡 Hero → `Video.mp4` — done
- 🟢 Add 27-years video section with `Platinum_Final.mp4` — done
- 🔵 Centre all mobile elements — done
- 🟣 Virtual Tours page → 15 clients + `virtualtours.jpeg` — done

### Round 2 — screenshot feedback

- Inactive gallery filter buttons were white-on-white → dark text
- Gallery card titles invisible → restructured cards (black text below image)
- Chipotle Markville thumbnail broken → `#` encoding fix
- Clicking a project only showed 1 photo → preload links per project, full gallery navigation
- Hero bottom gradient (black → transparent) — done
- Mobile menu close button — done
- Mobile hero display — now full-screen video background with text overlay (same as desktop intent), scroll indicator below buttons inside viewport
- All body sections across the site → white / ivory (about Philosophy, services Process)

### Round 3

- **Sidebar also white** — sidebar switched to `--color-light-alt` (#f7f5f1 ivory). Chose a tinted near-white rather than pure white so the dark logo rectangle reads acceptably; nav text, CTA, social icons, tagline all flipped to dark.

### Round 4

- **Logo size** — Reverted to 56px (Round 4 bump to 78px rolled back per client).
- **Favicon** — `logo.png` wired as `<link rel="icon" type="image/png" href="logo.png" />` on all 7 HTML pages so the browser tab shows the brand mark.

### Round 5

- **New hero video** — `Video.mp4` replaced by `Hero_Video_Platinum.mp4` in `index.html`.
- **Cinematic hero intro** — Hero video now plays once (no `loop`). Text content + scroll indicator start hidden (`.hero-content-hidden`, `.hero-scroll-hidden`) and fade in smoothly when the video fires `ended`. The video is then paused ~0.05s before its end so the last frame stays painted as the static background behind the titles. Safety net reveals content after 8s if the video fails to load.
- **Bottom gradient preserved** — `.hero::after` black→transparent gradient kept.

### Round 6

- **Editorial gallery timeline** — `gallery-render.js` now groups projects by completion year. Dated projects render under year headers (newest → oldest); undated ones bucket into a "recent" section at the top.
- **Completion-dates CSV** — `Projects_Completion_Dates.csv` sent to the client to fill in missing per-project years. Until it comes back, most projects stay in the "recent" bucket (only Firehouse Subs and KFC have a `year` set in `assets/js/projects-data.js`).

### Round 7

- **Edo Japan gallery cover fix** — The Edo Japan folder's `image_0.jpg` was actually a Starbucks/Chipotle storefront photo mixed in by mistake, so the gallery card and lightbox first slide showed the wrong project. Removed it, renumbered the 18 real Edo Japan photos to `image_0..image_17`, dropped the count `19 → 18` in `projects-data.js`. Also added `projects/* (raw)/` to `.gitignore` so source-of-truth raw folders never get committed.

### Round 8 — 2026-06-04 — Responsive audit

- **Full responsive audit** of all pages × desktop (1440) / tablet (768) / mobile (390) via agent-browser + system Chrome.
- 🔴 **Fixed: services.html "Contract Options" overflowed horizontally on mobile.** The process grid used an inline `grid-template-columns:repeat(3,1fr)` with no responsive override (inline styles can't be overridden by a media query), so it stayed 3-wide → horizontal scroll. Added the same scoped `<style>` max-width:900px → 1 column that `about.html` already uses. Commit `584d865`, pushed to `main` (Vercel auto-deploy). *(Commit subject has a stray `@` from a shell-syntax slip — cosmetic, history not rewritten to avoid a force-push.)*
- **New pages now in repo** (not previously documented): `blog.html`, `blog/building-out-commercial-space-ontario.html`, `seo-strategy.html` (internal), `hero-prism-preview.html` (preview). All render responsively. There is also an untracked `_site/` (Eleventy build output) — **not deployed**; the live site serves the root `*.html`. Edit the root files, not `_site/`.
- **Audit non-bugs** (artifacts of the offline test env, fine in production): gallery images are `loading="lazy"` (don't load in a full-page screenshot); contact's two empty boxes are Google Maps `<iframe>`s (need internet); stat counters show `0` until scroll-triggered. `.reveal` sections stay `opacity:0` until scrolled into view.
- **Local dev note:** `npx live-server` hangs on its install prompt here → use `python -m http.server 5500` instead.

### Round 9 — 2026-06-11 — Two new Chipotle Waterloo projects

- Added **Chipotle — 550 King St N, Waterloo, ON** (30 photos) and **Chipotle — 655 Erb St W, Waterloo, ON** (33 photos) to the gallery. Addresses verified online (locations.chipotle.ca). Façade photo set as `image_0` (cover). `year: 2026` is an **estimate** chosen by Saïbo — confirm with client if they ever supply real completion dates. Cache-buster `projects-data.js?v=7`. Commit `fc4902f`, deployed and verified in prod by Saïbo.
- Reminder confirmed: local headless check showed cover `naturalWidth: 0` — lazy-load false positive, fine in prod (matches the Round 8 audit non-bugs list).
- Folder-rename gotcha: Windows Explorer open on a folder locks it (`Device or resource busy` on `mv`); also each Bash call is a fresh process — `cd` into a folder being renamed fails silently from a stale cwd.

### Round 10 — 2026-06-11 — SEO meta titles + descriptions

- Applied the SEO team's on-page plan (PDF `platinum construction Work Report - Existance page On page SEO.pdf`, kept local/gitignored): new meta title + description on all 8 pages, verbatim. Focus keyword **"Commercial Construction Company in Canada"** — note the positioning shift from Ontario to Canada-wide. Synced `<title>` + OG + Twitter tags + home JSON-LD `WebPage.name`. Commits `1e33eb1` (metas) + `3d5946e` (.gitignore), deployed.
- Flagged to Saïbo (not yet relayed to SEO team): About/Contact titles ~72–74 chars will truncate in Google (~60); Ontario→Canada repositioning worth confirming.
- Gotcha: `blog.html` uses a raw `&` in its title (not `&amp;`) unlike other pages.

## Status

- ✅ Client validation — done
- ✅ Matterport URLs — handled by Saïbo (the 14 "SOON" tour cards on the Virtual Tours page remain as the final shipping state unless updated later)
- ✅ All client feedback rounds (Changes/ folder screenshots) — addressed
- ❌ WordPress + Elementor port — **cancelled**; the static site is the final deliverable
- ✅ **Hero section animation video** — `Hero.mp4` + Story modal (`Platinum-30 Years_v18.mp4`). Commit `ab31d82`.
- ✅ **Projects timeline** — all 41+2 projects have `year:` wired (client CSV + 2026 estimates for the two Waterloo Chipotles). Commits `b2a47ae`, `fc4902f`.

**Project is ship-ready.** Remaining items are external: domain-switch decision (security hardening + SEO/GSC follow-up — see memory files).

## Conventions

- English copy only
- CRLF line endings on Windows (git warns but converts automatically)
- Don't commit `_tmp_docx/` or `retour_client.docx` (already in `.gitignore`)
- When adding new photos: drop into `projects/<slug>/image_N.jpg` and update `PROJECTS` in `assets/js/projects-data.js`
- When adding new tours: update `TOURS` in `assets/js/projects-data.js` (brand, title, location, category, optional cover, tour URL)
- Preserve the invariant: body background is white; only sidebar + footer + hero/page-hero are non-white
