/* =========================================================
   PLATINUM CONSTRUCTION — Main JS
   ========================================================= */
(function () {
  "use strict";

  /* -------- Header scroll state -------- */
  const header = document.querySelector(".site-header");
  if (header) {
    const onScroll = () => {
      header.classList.toggle("scrolled", window.scrollY > 60);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* -------- Burger / overlay menu -------- */
  const burger = document.querySelector(".burger");
  const overlay = document.querySelector(".nav-overlay");
  if (burger && overlay) {
    burger.addEventListener("click", () => {
      burger.classList.toggle("open");
      overlay.classList.toggle("open");
      document.body.style.overflow = overlay.classList.contains("open") ? "hidden" : "";
    });
    overlay.querySelectorAll("a").forEach(a => {
      a.addEventListener("click", () => {
        burger.classList.remove("open");
        overlay.classList.remove("open");
        document.body.style.overflow = "";
      });
    });
  }

  /* -------- Reveal on scroll (IntersectionObserver) -------- */
  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && reveals.length) {
    const io = new IntersectionObserver(
      entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );
    reveals.forEach(el => io.observe(el));
  }

  /* -------- Animated counters -------- */
  const counters = document.querySelectorAll("[data-counter]");
  if ("IntersectionObserver" in window && counters.length) {
    const countIO = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const el = e.target;
        const target = parseFloat(el.dataset.counter);
        const duration = 1800;
        const suffix = el.dataset.suffix || "";
        const start = performance.now();
        const tick = now => {
          const p = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          const val = Math.floor(eased * target);
          el.textContent = val + suffix;
          if (p < 1) requestAnimationFrame(tick);
          else el.textContent = target + suffix;
        };
        requestAnimationFrame(tick);
        countIO.unobserve(el);
      });
    }, { threshold: 0.5 });
    counters.forEach(c => countIO.observe(c));
  }

  /* -------- Portfolio filter -------- */
  const filterButtons = document.querySelectorAll(".portfolio-filter button");
  const portfolioItems = document.querySelectorAll(".portfolio-item, .tour-card");
  if (filterButtons.length) {
    filterButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        const filter = btn.dataset.filter;
        filterButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        portfolioItems.forEach(item => {
          const cats = (item.dataset.category || "").split(" ");
          if (filter === "all" || cats.includes(filter)) {
            item.style.display = "";
          } else {
            item.style.display = "none";
          }
        });
      });
    });
  }

  /* -------- Lightbox (images + iframes) -------- */
  const lightbox = document.querySelector(".lightbox");
  const lightboxContent = lightbox ? lightbox.querySelector(".lightbox-content") : null;
  let currentGallery = [];
  let currentIndex = 0;

  function openLightbox(html) {
    if (!lightbox) return;
    lightboxContent.innerHTML = html + `
      <button class="lightbox-close" aria-label="Close">&times;</button>
      <button class="lightbox-prev" aria-label="Previous">&#8249;</button>
      <button class="lightbox-next" aria-label="Next">&#8250;</button>`;
    lightbox.classList.add("open");
    document.body.style.overflow = "hidden";
    lightboxContent.querySelector(".lightbox-close").onclick = closeLightbox;
    lightboxContent.querySelector(".lightbox-prev").onclick = () => navGallery(-1);
    lightboxContent.querySelector(".lightbox-next").onclick = () => navGallery(1);
  }
  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove("open");
    lightboxContent.innerHTML = "";
    document.body.style.overflow = "";
  }
  function navGallery(delta) {
    if (!currentGallery.length) return;
    currentIndex = (currentIndex + delta + currentGallery.length) % currentGallery.length;
    const src = currentGallery[currentIndex];
    openLightbox(`<img src="${src}" alt="">`);
  }
  if (lightbox) {
    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener("keydown", e => {
      if (!lightbox.classList.contains("open")) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") navGallery(1);
      if (e.key === "ArrowLeft") navGallery(-1);
    });
  }

  /* Image gallery triggers */
  document.querySelectorAll("[data-lightbox]").forEach(el => {
    el.addEventListener("click", e => {
      e.preventDefault();
      const gallery = el.dataset.gallery;
      if (gallery) {
        const group = Array.from(document.querySelectorAll(`[data-gallery="${gallery}"]`));
        currentGallery = group.map(g => g.dataset.lightbox);
        currentIndex = group.indexOf(el);
      } else {
        currentGallery = [el.dataset.lightbox];
        currentIndex = 0;
      }
      openLightbox(`<img src="${el.dataset.lightbox}" alt="">`);
    });
  });

  /* Iframe triggers (virtual tours) */
  document.querySelectorAll("[data-tour]").forEach(el => {
    el.addEventListener("click", e => {
      e.preventDefault();
      const url = el.dataset.tour;
      if (!url || url === "#") {
        alert("Virtual tour link coming soon.");
        return;
      }
      currentGallery = [];
      openLightbox(`<iframe src="${url}" allowfullscreen></iframe>`);
    });
  });

  /* -------- Parallax hero (subtle) -------- */
  const heroBg = document.querySelector(".hero-bg, .page-hero-bg");
  if (heroBg) {
    window.addEventListener("scroll", () => {
      const y = window.scrollY;
      heroBg.style.transform = `translateY(${y * 0.3}px) scale(1.05)`;
    }, { passive: true });
  }

  /* -------- Current year in footer -------- */
  const yearEl = document.querySelector("[data-year]");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
