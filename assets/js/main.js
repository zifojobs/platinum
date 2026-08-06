/* =========================================================
   PLATINUM CONSTRUCTION — Main JS
   ========================================================= */
(function () {
  "use strict";

  /* -------- Hero video: reveal content on end, then loop in background -------- */
  const heroVideo = document.querySelector(".hero .hero-video");
  if (heroVideo) {
    const content = document.querySelector(".hero .hero-content");
    const scroll = document.querySelector(".hero .hero-scroll");
    const overlay = document.querySelector(".hero .hero-overlay");
    const reveal = () => {
      if (overlay) overlay.classList.add("is-visible");
      if (content) content.classList.remove("hero-content-hidden");
      if (scroll) scroll.classList.remove("hero-scroll-hidden");
    };

    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    if (isMobile) {
      // Mobile: no video, just the static background image. Reveal text after
      // a short delay so it feels intentional and cinematic.
      heroVideo.remove();
      setTimeout(reveal, 900);
    } else {
      // Desktop: load the assembled hero video and reveal text when it ends.
      const desktopSrc = heroVideo.getAttribute("data-src-desktop");
      if (desktopSrc) {
        const source = document.createElement("source");
        source.src = desktopSrc;
        source.type = "video/mp4";
        heroVideo.appendChild(source);
        heroVideo.load();
      }
      heroVideo.addEventListener("ended", () => {
        // Reveal the titles when the intro finishes, then keep the video
        // playing on a loop in the background (no frozen last frame).
        reveal();
        heroVideo.loop = true;
        try {
          heroVideo.currentTime = 0;
        } catch (e) {}
        const p = heroVideo.play();
        if (p && typeof p.catch === "function") p.catch(() => {});
      });
      // Safety net: if the video fails to load/play, reveal after a delay.
      heroVideo.addEventListener("error", reveal);
      setTimeout(() => {
        if (heroVideo.readyState < 2) reveal();
      }, 60000);
    }
  }

  /* -------- Hero sound toggle + auto-unmute on user gesture -------- */
  const soundBtn = document.getElementById("heroSound");
  const setSoundState = (unmuted) => {
    if (!heroVideo) return;
    heroVideo.muted = !unmuted;
    if (soundBtn) soundBtn.setAttribute("aria-pressed", String(unmuted));
  };
  if (soundBtn && heroVideo) {
    soundBtn.addEventListener("click", () => setSoundState(heroVideo.muted));
  }

  /* -------- Cinematic intro overlay (homepage, once per session) -------- */
  const introOverlay = document.getElementById("introOverlay");
  if (introOverlay) {
    if (sessionStorage.getItem("pcIntroSeen") === "1") {
      introOverlay.remove();
    } else {
      introOverlay.classList.add("is-active");
      document.body.classList.add("intro-active");
      let dismissed = false;
      const dismiss = (fromGesture) => {
        if (dismissed) return;
        dismissed = true;
        sessionStorage.setItem("pcIntroSeen", "1");
        introOverlay.classList.add("is-hidden");
        document.body.classList.remove("intro-active");
        // Only unmute when dismissed by an actual user gesture (browser autoplay policy)
        if (fromGesture) setSoundState(true);
        setTimeout(() => introOverlay.remove(), 700);
      };
      const skipBtn = document.getElementById("introSkip");
      if (skipBtn) skipBtn.addEventListener("click", (e) => { e.stopPropagation(); dismiss(true); });
      introOverlay.addEventListener("click", () => dismiss(true));
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" || e.key === "Enter") dismiss(true);
      });
      // Auto-dismiss safety net (no gesture — stays muted)
      setTimeout(() => dismiss(false), 2400);
    }
  }

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
  let lbPrev, lbNext, lbCounter;

  if (lightbox) {
    // Chrome (arrows, close, counter) is anchored to the full-screen overlay,
    // NOT to the image-sized .lightbox-content. This keeps the arrows fixed at
    // the viewport edges so they never shift with each photo's dimensions
    // (which made users miss the arrow and close the lightbox by accident).
    lightbox.insertAdjacentHTML("beforeend",
      '<button class="lightbox-close" aria-label="Close">&times;</button>' +
      '<button class="lightbox-prev" aria-label="Previous">&#8249;</button>' +
      '<button class="lightbox-next" aria-label="Next">&#8250;</button>' +
      '<div class="lightbox-counter" aria-live="polite"></div>');
    lbPrev = lightbox.querySelector(".lightbox-prev");
    lbNext = lightbox.querySelector(".lightbox-next");
    lbCounter = lightbox.querySelector(".lightbox-counter");
    lightbox.querySelector(".lightbox-close").onclick = closeLightbox;
    lbPrev.onclick = () => navGallery(-1);
    lbNext.onclick = () => navGallery(1);
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

  function updateChrome() {
    const multi = currentGallery.length > 1;
    lbPrev.style.display = multi ? "" : "none";
    lbNext.style.display = multi ? "" : "none";
    if (multi) {
      lbCounter.textContent = (currentIndex + 1) + " of " + currentGallery.length;
      lbCounter.style.display = "";
    } else {
      lbCounter.style.display = "none";
    }
  }
  function showImage() {
    lightboxContent.innerHTML = `<img src="${currentGallery[currentIndex]}" alt="">`;
    updateChrome();
    openPanel();
  }
  function openIframe(url) {
    currentGallery = [];
    lightboxContent.innerHTML = `<iframe src="${url}" allowfullscreen></iframe>`;
    updateChrome();
    openPanel();
  }
  function openPanel() {
    lightbox.classList.add("open");
    document.body.style.overflow = "hidden";
  }
  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove("open");
    lightboxContent.innerHTML = "";
    document.body.style.overflow = "";
  }
  function navGallery(delta) {
    if (currentGallery.length < 2) return;
    currentIndex = (currentIndex + delta + currentGallery.length) % currentGallery.length;
    showImage();
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
      showImage();
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
      openIframe(url);
    });
  });

  /* -------- Story video modal (blurred backdrop, minimal controls) -------- */
  const storyModal = document.getElementById("storyModal");
  if (storyModal) {
    const trigger = document.getElementById("storyTrigger");
    const video = document.getElementById("storyVideo");
    const closeBtn = document.getElementById("storyClose");
    const toggleBtn = document.getElementById("storyToggle");
    const fsBtn = document.getElementById("storyFs");

    const openStory = () => {
      storyModal.classList.add("open");
      storyModal.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      video.play().catch(() => {});
    };
    const closeStory = () => {
      storyModal.classList.remove("open");
      storyModal.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      video.pause();
      video.currentTime = 0;
    };
    const togglePlay = () => {
      if (video.paused) video.play().catch(() => {});
      else video.pause();
    };

    if (trigger) trigger.addEventListener("click", openStory);
    closeBtn.addEventListener("click", closeStory);
    toggleBtn.addEventListener("click", togglePlay);
    video.addEventListener("click", togglePlay);
    video.addEventListener("play", () => storyModal.classList.add("is-playing"));
    video.addEventListener("pause", () => storyModal.classList.remove("is-playing"));
    video.addEventListener("ended", () => storyModal.classList.remove("is-playing"));
    fsBtn.addEventListener("click", () => {
      const el = video;
      if (el.requestFullscreen) el.requestFullscreen();
      else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
      else if (el.webkitEnterFullscreen) el.webkitEnterFullscreen(); /* iOS */
    });
    storyModal.addEventListener("click", (e) => {
      if (e.target === storyModal) closeStory();
    });
    document.addEventListener("keydown", (e) => {
      if (!storyModal.classList.contains("open")) return;
      if (e.key === "Escape") closeStory();
      if (e.key === " " || e.code === "Space") { e.preventDefault(); togglePlay(); }
    });
  }

  /* -------- Parallax hero (subtle) — only for image backgrounds, not video -------- */
  const heroBg = document.querySelector(".page-hero-bg, .hero:not(:has(.hero-video)) .hero-bg");
  if (heroBg) {
    window.addEventListener("scroll", () => {
      const y = window.scrollY;
      heroBg.style.transform = `translateY(${y * 0.3}px) scale(1.05)`;
    }, { passive: true });
  }

  /* -------- Article table of contents (blog posts only) --------
     One entry per h2 that carries an id, labelled with the heading's own text.
     Headings without an id are skipped, so the markup decides what appears —
     not this file. That is how the FAQ questions stay out of the list while
     keeping their ids, and therefore their anchors. */
  const toc = document.querySelector(".article__toc");
  if (toc) {
    const articleBody = document.querySelector(".article__body");
    const tocList = toc.querySelector(".article__toc-list");
    const headings = articleBody
      ? Array.from(articleBody.querySelectorAll("h2[id]"))
      : [];

    if (headings.length < 2) {
      toc.remove();
    } else {
      const links = [];

      headings.forEach(heading => {
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.href = "#" + heading.id;
        a.textContent = heading.textContent.trim();
        li.appendChild(a);
        links.push({ link: a, heading: heading });
        tocList.appendChild(li);
      });

      /* Collapsible card (below 1200px — above that the CSS keeps it open) */
      const toggle = toc.querySelector(".article__toc-toggle");
      if (toggle) {
        toggle.addEventListener("click", () => {
          const open = toc.classList.toggle("is-open");
          toggle.setAttribute("aria-expanded", open ? "true" : "false");
        });
      }
      /* Tapping an entry on mobile closes the card so the reader sees the text */
      tocList.addEventListener("click", e => {
        if (e.target.tagName === "A" && window.innerWidth < 1200) {
          toc.classList.remove("is-open");
          if (toggle) toggle.setAttribute("aria-expanded", "false");
        }
      });

      /* Highlight the section being read: the last heading scrolled past */
      let ticking = false;
      const setActive = () => {
        ticking = false;
        let current = links[0];
        links.forEach(item => {
          if (item.heading.getBoundingClientRect().top <= 140) current = item;
        });
        links.forEach(item => {
          item.link.classList.toggle("is-active", item === current);
        });
      };
      window.addEventListener("scroll", () => {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(setActive);
      }, { passive: true });
      setActive();
    }
  }

  /* -------- Current year in footer (legacy, only updates <span data-year>) -------- */
  const yearEl = document.querySelector("span[data-year]");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
