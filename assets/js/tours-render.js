/* Render virtual tour cards from PROJECTS data */
(function () {
  const grid = document.getElementById("tours-grid");
  const filterWrap = document.getElementById("tours-filter");
  if (!grid || !window.PROJECTS) return;

  const projects = window.PROJECTS;
  const cats = Array.from(new Set(projects.map(p => p.category)));
  const filters = ["all", ...cats];
  if (filterWrap) {
    filterWrap.innerHTML = filters
      .map((c, i) => `<button data-filter="${c}" class="${i === 0 ? "active" : ""}">${window.CATEGORY_LABELS[c] || c}</button>`)
      .join("");
  }

  grid.innerHTML = projects
    .map(p => {
      const cover = `projects/${encodeURI(p.slug)}/image_0.jpg`;
      return `
        <a href="#" class="tour-card" data-category="${p.category}" data-tour="${p.tour || "#"}">
          <div class="tour-thumb">
            <img src="${cover}" alt="${p.title}" loading="lazy" />
            <div class="tour-play" aria-hidden="true"></div>
          </div>
          <div class="tour-body">
            <div class="tour-cat">${p.brand}</div>
            <div class="tour-title">${p.title}</div>
            <div class="tour-loc">${p.location}</div>
          </div>
        </a>`;
    })
    .join("");
})();
