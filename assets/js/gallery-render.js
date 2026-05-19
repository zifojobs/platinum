/* Render gallery as an editorial timeline grouped by completion year.
   Falls back to a single grid if the host page doesn't have #gallery-grid. */
(function () {
  const grid = document.getElementById("gallery-grid");
  const filterWrap = document.getElementById("gallery-filter");
  if (!grid || !window.PROJECTS) return;

  // encodeURI leaves "#" unescaped (it's the fragment delimiter) — escape it for folder names like "Hwy#7"
  const urlPath = (slug) => encodeURI(slug).replace(/#/g, "%23");
  const itemId = (slug) => `project-${slug.replace(/[^a-z0-9]/gi, "-")}`;

  const projects = window.PROJECTS;
  const cats = Array.from(new Set(projects.map(p => p.category)));

  // Build filter buttons (only if container is present — kept for future use)
  if (filterWrap) {
    const filters = ["all", ...cats];
    filterWrap.innerHTML = filters
      .map((c, i) => `<button data-filter="${c}" class="${i === 0 ? "active" : ""}">${window.CATEGORY_LABELS[c] || c}</button>`)
      .join("");
  }

  // Group projects by year. Dated projects bucket by their year; undated go to "recent".
  const groups = new Map();
  projects.forEach(p => {
    const key = (typeof p.year === "number") ? String(p.year) : "recent";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(p);
  });

  // Order: "recent" first, then years descending (most recent → oldest).
  const orderedKeys = Array.from(groups.keys())
    .filter(k => k !== "recent")
    .sort((a, b) => Number(b) - Number(a));
  if (groups.has("recent")) orderedKeys.unshift("recent");

  const cardHTML = (p) => {
    const folder = urlPath(p.slug);
    const cover = `projects/${folder}/image_0.jpg`;
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

  // Convert the grid container into a timeline wrapper.
  grid.classList.remove("portfolio-grid");
  grid.classList.add("gallery-timeline");

  grid.innerHTML = orderedKeys.map(key => {
    const list = groups.get(key);
    const cards = list.map(cardHTML).join("");
    // Undated projects render as a plain 5-col grid (no editorial header).
    if (key === "recent") {
      return `
        <section class="gallery-year-section" data-year="recent">
          <div class="portfolio-grid" id="gallery-grid-recent">
            ${cards}
          </div>
        </section>`;
    }
    const sublabel = `${list.length} project${list.length > 1 ? "s" : ""}`;
    return `
      <section class="gallery-year-section" data-year="${key}">
        <header class="gallery-year-header">
          <div class="gallery-year-line" aria-hidden="true"></div>
          <h3 class="gallery-year-label">${key}</h3>
          <div class="gallery-year-meta">${sublabel}</div>
        </header>
        <div class="portfolio-grid" id="gallery-grid-${key}">
          ${cards}
        </div>
      </section>`;
  }).join("");

  // Hidden preload links so the lightbox can navigate every image of a clicked project
  const preload = document.createElement("div");
  preload.style.display = "none";
  projects.forEach(p => {
    const folder = urlPath(p.slug);
    const gid = itemId(p.slug);
    for (let i = 1; i < p.images; i++) {
      const a = document.createElement("a");
      a.dataset.lightbox = `projects/${folder}/image_${i}.jpg`;
      a.dataset.gallery = gid;
      preload.appendChild(a);
    }
  });
  document.body.appendChild(preload);

  // Year-section reveal: fade-up header + staggered cards as each section scrolls in.
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add("is-revealed");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -8% 0px" });
    grid.querySelectorAll(".gallery-year-section").forEach(s => io.observe(s));
  } else {
    grid.querySelectorAll(".gallery-year-section").forEach(s => s.classList.add("is-revealed"));
  }
})();
