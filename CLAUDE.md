# Platinum Construction Corporation — Project Context

Context file for AI assistants working on this repo. Update this as the project evolves.

## Overview

- Client: **Platinum Construction Corporation** — commercial general contractor in Vaughan, ON, operating since 1997
- Old site: https://platinumconstruction.com/home/
- Repo: https://github.com/zifojobs/platinum.git (deployed to Vercel from `main`)
- Approach: static HTML/CSS/JS prototype first, then port to WordPress + Elementor after client validation
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

- **Primary background: white** (`--color-light: #ffffff`) — client directive
- Accent gold `--color-accent: #b8935a` (matches the logo's tagline colour)
- Ivory tint `--color-light-alt: #f7f5f1` — used for the sidebar, testimonial, about/services secondary sections
- Dark text `--color-text-dark: #1a1a1a`; muted `rgba(26,26,26,0.62)`
- **Sidebar: ivory (`--color-light-alt`)**. The logo has a dark rectangle baked-in so it reads on ivory but not on pure white — this is why the sidebar uses a tinted near-white rather than `#ffffff`.
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

### Round 3 — current

- **Sidebar also white** — sidebar switched to `--color-light-alt` (#f7f5f1 ivory). Chose a tinted near-white rather than pure white so the dark logo rectangle reads acceptably; nav text, CTA, social icons, tagline all flipped to dark.

## Pending from client

- Matterport URLs for the remaining 14 virtual tours (pending from WP dashboard)
- Final client validation
- Port to WordPress + Elementor

## Conventions

- English copy only
- CRLF line endings on Windows (git warns but converts automatically)
- Don't commit `_tmp_docx/` or `retour_client.docx` (already in `.gitignore`)
- When adding new photos: drop into `projects/<slug>/image_N.jpg` and update `PROJECTS` in `assets/js/projects-data.js`
- When adding new tours: update `TOURS` in `assets/js/projects-data.js` (brand, title, location, category, optional cover, tour URL)
- Preserve the invariant: body background is white; only sidebar + footer + hero/page-hero are non-white
