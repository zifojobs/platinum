/* Render gallery grid + filters + lightbox from PROJECTS data */
(function () {
  const grid = document.getElementById("gallery-grid");
  const filterWrap = document.getElementById("gallery-filter");
  if (!grid || !window.PROJECTS) return;

  // encodeURI leaves "#" unescaped (it's the fragment delimiter) — escape it for folder names like "Hwy#7"
  const urlPath = (slug) => encodeURI(slug).replace(/#/g, "%23");

  const projects = window.PROJECTS;
  const cats = Array.from(new Set(projects.map(p => p.category)));

  // Build filter buttons
  const filters = ["all", ...cats];
  filterWrap.innerHTML = filters
    .map((c, i) => `<button data-filter="${c}" class="${i === 0 ? "active" : ""}">${window.CATEGORY_LABELS[c] || c}</button>`)
    .join("");

  // Build grid — image on top, title/location below in black
  grid.innerHTML = projects
    .map(p => {
      const folder = urlPath(p.slug);
      const cover = `projects/${folder}/image_0.jpg`;
      const galleryId = `project-${p.slug.replace(/[^a-z0-9]/gi, "-")}`;
      return `
        <a href="#" class="portfolio-item" data-category="${p.category}" data-lightbox="${cover}" data-gallery="${galleryId}">
          <div class="portfolio-thumb">
            <img src="${cover}" alt="${p.title} — ${p.location}" loading="lazy" />
          </div>
          <div class="portfolio-info">
            <div class="portfolio-category">${p.brand}</div>
            <div class="portfolio-title">${p.title}</div>
            <div class="portfolio-loc">${p.location} · ${p.images} photos</div>
          </div>
        </a>`;
    })
    .join("");

  // Hidden preload links for full gallery per project (so lightbox can navigate all photos)
  const preload = document.createElement("div");
  preload.style.display = "none";
  projects.forEach(p => {
    const folder = urlPath(p.slug);
    const galleryId = `project-${p.slug.replace(/[^a-z0-9]/gi, "-")}`;
    for (let i = 1; i < p.images; i++) {
      const a = document.createElement("a");
      a.dataset.lightbox = `projects/${folder}/image_${i}.jpg`;
      a.dataset.gallery = galleryId;
      preload.appendChild(a);
    }
  });
  document.body.appendChild(preload);
})();
