/* Render gallery as a single flat grid, ordered by completion year (newest →
   oldest) but with NO visible year labels (client asked to remove the years).
   Falls back to nothing if the host page doesn't have #gallery-grid. */
(function () {
  const grid = document.getElementById("gallery-grid");
  const filterWrap = document.getElementById("gallery-filter");
  if (!grid || !window.PROJECTS) return;

  // encodeURI leaves "#" unescaped (it's the fragment delimiter) — escape it for folder names like "Hwy#7"
  const urlPath = (slug) => encodeURI(slug).replace(/#/g, "%23");
  const itemId = (slug) => `project-${slug.replace(/[^a-z0-9]/gi, "-")}`;
  // Bump when a project photo is *replaced* in place (same filename, new content)
  // so browsers/CDN don't keep serving the cached old image. e.g. DQ Alliston cover.
  const IMG_V = "3";
  const img = (path) => `${path}?v=${IMG_V}`;

  const projects = window.PROJECTS;
  const cats = Array.from(new Set(projects.map(p => p.category)));

  // Build filter buttons (only if container is present — kept for future use)
  if (filterWrap) {
    const filters = ["all", ...cats];
    filterWrap.innerHTML = filters
      .map((c, i) => `<button data-filter="${c}" class="${i === 0 ? "active" : ""}">${window.CATEGORY_LABELS[c] || c}</button>`)
      .join("");
  }

  // Order projects by completion year (newest → oldest); undated bucket first.
  // We keep the ordering but render a single flat grid with no year headers.
  const groups = new Map();
  projects.forEach(p => {
    const key = (typeof p.year === "number") ? String(p.year) : "recent";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(p);
  });
  const orderedKeys = Array.from(groups.keys())
    .filter(k => k !== "recent")
    .sort((a, b) => Number(b) - Number(a));
  if (groups.has("recent")) orderedKeys.unshift("recent");
  const orderedProjects = orderedKeys.flatMap(k => groups.get(k));

  const cardHTML = (p) => {
    const folder = urlPath(p.slug);
    const cover = img(`projects/${folder}/image_0.jpg`);
    return `
      <a href="#" class="portfolio-item" data-category="${p.category}" data-lightbox="${cover}" data-gallery="${itemId(p.slug)}">
        <div class="portfolio-thumb">
          <img src="${cover}" alt="${p.title} — ${p.location}" loading="lazy" />
        </div>
        <div class="portfolio-info">
          <div class="portfolio-category">${p.brand}</div>
          <div class="portfolio-title">${p.title}</div>
          <div class="portfolio-loc">${p.location} · ${p.images} photos</div>
        </div>
      </a>`;
  };

  // Single flat 5-column grid — no year sections, no headers.
  grid.classList.add("portfolio-grid");
  grid.classList.remove("gallery-timeline");
  grid.innerHTML = orderedProjects.map(cardHTML).join("");

  // Hidden preload links so the lightbox can navigate every image of a clicked project
  const preload = document.createElement("div");
  preload.style.display = "none";
  projects.forEach(p => {
    const folder = urlPath(p.slug);
    const gid = itemId(p.slug);
    for (let i = 1; i < p.images; i++) {
      const a = document.createElement("a");
      a.dataset.lightbox = img(`projects/${folder}/image_${i}.jpg`);
      a.dataset.gallery = gid;
      preload.appendChild(a);
    }
  });
  document.body.appendChild(preload);
})();
