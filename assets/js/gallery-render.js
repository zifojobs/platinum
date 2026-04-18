/* Render gallery grid + filters + lightbox from PROJECTS data */
(function () {
  const grid = document.getElementById("gallery-grid");
  const filterWrap = document.getElementById("gallery-filter");
  if (!grid || !window.PROJECTS) return;

  const projects = window.PROJECTS;
  const cats = Array.from(new Set(projects.map(p => p.category)));

  // Build filter buttons
  const filters = ["all", ...cats];
  filterWrap.innerHTML = filters
    .map((c, i) => `<button data-filter="${c}" class="${i === 0 ? "active" : ""}">${window.CATEGORY_LABELS[c] || c}</button>`)
    .join("");

  // Build grid
  grid.innerHTML = projects
    .map(p => {
      const cover = `projects/${encodeURI(p.slug)}/image_0.jpg`;
      return `
        <a href="#" class="portfolio-item" data-category="${p.category}" data-lightbox="${cover}" data-gallery="project-${p.slug.replace(/[^a-z0-9]/gi, "-")}">
          <img src="${cover}" alt="${p.title} — ${p.location}" loading="lazy" />
          <div class="portfolio-caption">
            <div class="portfolio-category">${p.brand}</div>
            <div class="portfolio-title">${p.title}</div>
            <div style="color:rgba(255,255,255,0.7);font-size:.8rem;margin-top:4px;">${p.location}</div>
          </div>
        </a>`;
    })
    .join("");

  // Hidden preload links for full gallery per project (for lightbox nav)
  const preload = document.createElement("div");
  preload.style.display = "none";
  projects.forEach(p => {
    const gallery = `project-${p.slug.replace(/[^a-z0-9]/gi, "-")}`;
    for (let i = 1; i < p.images; i++) {
      const a = document.createElement("a");
      a.dataset.lightbox = `projects/${encodeURI(p.slug)}/image_${i}.jpg`;
      a.dataset.gallery = gallery;
      preload.appendChild(a);
    }
  });
  document.body.appendChild(preload);
})();
