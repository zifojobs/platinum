# Platinum Construction Corporation — Website Refresh

A modern, Bauen-inspired multi-page website for **Platinum Construction Corporation** — commercial general contractor serving Ontario since 1997.

> HTML/CSS/JS prototype to be ported to WordPress + Elementor after client validation.

## Pages

- `index.html` — Home (hero, stats, services, portfolio teaser, testimonial, CTA)
- `about.html` — Story, philosophy, stats, brand partners
- `services.html` — 9 services + 4-step process
- `gallery.html` — Filterable project grid + lightbox
- `virtual-tours.html` — 360° tour cards (URLs pending from WP dashboard)
- `environmental-policy.html` — 5 sustainability principles
- `contact.html` — Form, contact info, Google Maps

## Design

- **Inspiration**: [Bauen Architecture Template](https://themeforest.net/item/bauen-architecture-interior-template/30110777)
- **Layout**: Fixed left sidebar (280px) — logo, vertical nav, CTA, social icons, tagline
- **Typography**: Oswald (display) + Inter (body) via Google Fonts
- **Palette**: charcoal `#0e0e0e` / ivory `#f5f2ed` / platinum `#b8935a`

## Structure

```
├── *.html                # 7 pages
├── logo-dark.png         # Logo
├── assets/
│   ├── css/main.css      # Design system + components
│   └── js/
│       ├── main.js               # Scroll, reveal, counters, lightbox, filter
│       ├── layout.js             # Injects socials + tagline into sidebar
│       ├── projects-data.js      # Project catalog (single source of truth)
│       ├── gallery-render.js     # Renders gallery from data
│       └── tours-render.js       # Renders virtual tour cards
└── projects/             # Project photo assets (21 folders)
```

## Local dev

```bash
npx live-server --port=5500
# or
python -m http.server 8000
```

## Pending

- [ ] Collect 360° tour embed URLs from WP dashboard → update `assets/js/projects-data.js` (`tour` field)
- [ ] Client validation
- [ ] Port to WordPress + Elementor

## Contact

**Platinum Construction Corporation**
83 Citation Dr. Unit 2, Vaughan, ON L4K 2Z6
905-763-8119 · info@platinumconstruction.com
