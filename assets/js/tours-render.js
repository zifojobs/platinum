/* Render virtual tour cards from the official TOURS list (15 clients) */
(function () {
  const grid = document.getElementById("tours-grid");
  const filterWrap = document.getElementById("tours-filter");
  if (!grid || !window.TOURS) return;

  const tours = window.TOURS;
  const cats = Array.from(new Set(tours.map(t => t.category)));
  const filters = ["all", ...cats];
  if (filterWrap) {
    filterWrap.innerHTML = filters
      .map((c, i) => `<button data-filter="${c}" class="${i === 0 ? "active" : ""}">${window.CATEGORY_LABELS[c] || c}</button>`)
      .join("");
  }

  grid.innerHTML = tours
    .map(t => {
      const isLive = t.tour && t.tour !== "#";
      const thumb = t.cover
        ? `<img src="${t.cover}" alt="${t.title}" loading="lazy" />`
        : `<div class="tour-placeholder"><span>${t.brand}</span></div>`;
      const badge = isLive ? "360°" : "Soon";
      return `
        <a href="${isLive ? t.tour : '#'}" class="tour-card ${isLive ? 'is-live' : 'is-pending'}" data-category="${t.category}" data-tour="${t.tour || "#"}" ${isLive ? 'target="_blank" rel="noopener"' : ''}>
          <div class="tour-thumb" data-badge="${badge}">
            ${thumb}
            <div class="tour-play" aria-hidden="true"></div>
          </div>
          <div class="tour-body">
            <div class="tour-cat">${t.brand}</div>
            <div class="tour-title">${t.title}</div>
            <div class="tour-loc">${t.location}</div>
          </div>
        </a>`;
    })
    .join("");
})();
