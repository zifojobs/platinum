/* Augment existing header/footer with sidebar extras (socials, tagline)
   Runs synchronously so main.js's event bindings see the final DOM. */
(function () {
  const SOCIALS = [
    { href: "https://www.facebook.com/people/Platinum-Construction-Corporation/100064126741481/", label: "Facebook", svg: '<svg viewBox="0 0 24 24"><path d="M12 2C6.5 2 2 6.5 2 12c0 5 3.7 9.1 8.4 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.3v7C18.3 21.1 22 17 22 12c0-5.5-4.5-10-10-10z"/></svg>' },
    { href: "https://www.instagram.com/platinum_construction_corp/", label: "Instagram", svg: '<svg viewBox="0 0 24 24"><path d="M12 2.2c3.2 0 3.6 0 4.8.1 1.2.1 1.8.2 2.2.4.6.2 1 .5 1.4.9.4.4.7.9.9 1.4.2.4.4 1 .4 2.2.1 1.3.1 1.6.1 4.8s0 3.6-.1 4.8c-.1 1.2-.2 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.9.7-1.4.9-.4.2-1 .4-2.2.4-1.3.1-1.6.1-4.8.1s-3.6 0-4.8-.1c-1.2-.1-1.8-.2-2.2-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.9-.9-1.4-.2-.4-.4-1-.4-2.2-.1-1.3-.1-1.6-.1-4.8s0-3.6.1-4.8c.1-1.2.2-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.9-.7 1.4-.9.4-.2 1-.4 2.2-.4 1.2-.1 1.6-.1 4.8-.1zm0 5.3c-2.5 0-4.5 2-4.5 4.5s2 4.5 4.5 4.5 4.5-2 4.5-4.5-2-4.5-4.5-4.5zm0 7.5c-1.7 0-3-1.3-3-3s1.3-3 3-3 3 1.3 3 3-1.3 3-3 3zm4.7-7.7c-.6 0-1-.5-1-1s.5-1 1-1 1 .5 1 1-.5 1-1 1z"/></svg>' },
    { href: "https://mobile.twitter.com/platinumconst1", label: "Twitter", svg: '<svg viewBox="0 0 24 24"><path d="M22 5.8c-.7.3-1.5.5-2.4.6.9-.5 1.5-1.3 1.8-2.3-.8.5-1.7.8-2.6 1-.8-.8-1.9-1.3-3.1-1.3-2.3 0-4.2 1.9-4.2 4.2 0 .3 0 .7.1 1C8.1 8.9 5.1 7.3 3 4.8c-.4.6-.6 1.3-.6 2.1 0 1.5.7 2.8 1.9 3.5-.7 0-1.3-.2-1.9-.5v.1c0 2 1.5 3.7 3.4 4.1-.4.1-.7.2-1.1.2-.3 0-.5 0-.8-.1.5 1.6 2 2.8 3.9 2.9-1.4 1.1-3.2 1.8-5.2 1.8-.3 0-.7 0-1-.1 1.9 1.2 4 1.9 6.3 1.9 7.5 0 11.6-6.2 11.6-11.6v-.5c.8-.5 1.5-1.2 2-2z"/></svg>' },
    { href: "https://www.linkedin.com/company/platinum-construction-corporation", label: "LinkedIn", svg: '<svg viewBox="0 0 24 24"><path d="M20.5 2h-17C2.7 2 2 2.7 2 3.5v17c0 .8.7 1.5 1.5 1.5h17c.8 0 1.5-.7 1.5-1.5v-17c0-.8-.7-1.5-1.5-1.5zM8 18.5H5V10h3v8.5zM6.5 8.3c-1 0-1.7-.8-1.7-1.7S5.5 5 6.5 5s1.7.8 1.7 1.7-.8 1.6-1.7 1.6zM19 18.5h-3v-4.4c0-1.1 0-2.4-1.5-2.4s-1.7 1.2-1.7 2.4v4.5h-3V10h2.9v1.3c.4-.8 1.4-1.5 2.8-1.5 3 0 3.5 2 3.5 4.5v4.2z"/></svg>' }
  ];

  const socialHTML = SOCIALS.map(s => `<a href="${s.href}" target="_blank" rel="noopener" aria-label="${s.label}">${s.svg}</a>`).join("");

  // ---- Sidebar header enhancement ----
  const header = document.querySelector(".site-header .header-inner");
  if (header) {
    const cta = header.querySelector(".header-cta");
    const burger = header.querySelector(".burger");

    // Build header-bottom section (socials + CTA + tagline)
    const bottom = document.createElement("div");
    bottom.className = "header-bottom";
    bottom.innerHTML = `
      ${cta ? "" : ""}
      <div class="header-social">${socialHTML}</div>
      <div class="header-tagline">Building since 1997</div>
    `;
    // move CTA inside bottom, above socials
    if (cta) {
      cta.parentNode.removeChild(cta);
      bottom.insertBefore(cta, bottom.firstChild);
    }
    // insert bottom before burger, or at end
    if (burger) header.insertBefore(bottom, burger);
    else header.appendChild(bottom);
  }

  // ---- Open footer social links in a new tab ----
  document.querySelectorAll(".footer-social a").forEach(a => {
    a.setAttribute("target", "_blank");
    a.setAttribute("rel", "noopener noreferrer");
  });

  // ---- Sticky scroll-reveal wrapper for the footer ----
  const footer = document.querySelector(".site-footer");
  if (footer && !footer.closest(".footer-reveal")) {
    const reveal = document.createElement("div");
    reveal.className = "footer-reveal";
    const spacer = document.createElement("div");
    spacer.className = "footer-reveal-spacer";
    const sticky = document.createElement("div");
    sticky.className = "footer-reveal-sticky";
    footer.parentNode.insertBefore(reveal, footer);
    reveal.appendChild(spacer);
    spacer.appendChild(sticky);
    sticky.appendChild(footer);
  }

  // ---- Overlay social row + close button ----
  const overlay = document.querySelector(".nav-overlay");
  if (overlay) {
    if (!overlay.querySelector(".nav-overlay-close")) {
      const close = document.createElement("button");
      close.className = "nav-overlay-close";
      close.setAttribute("aria-label", "Close menu");
      close.addEventListener("click", () => {
        overlay.classList.remove("open");
        const burger = document.querySelector(".burger");
        if (burger) burger.classList.remove("open");
        document.body.style.overflow = "";
      });
      overlay.appendChild(close);
    }
    if (!overlay.querySelector(".nav-overlay-social")) {
      const row = document.createElement("div");
      row.className = "nav-overlay-social";
      row.innerHTML = socialHTML;
      overlay.appendChild(row);
    }
  }

  // ---- Back-to-top button (sitewide) — with scroll-progress ring ----
  if (!document.querySelector(".back-to-top")) {
    const btn = document.createElement("button");
    btn.className = "back-to-top has-progress";
    btn.type = "button";
    btn.setAttribute("aria-label", "Back to top");

    // Progress ring overlay (radius 22 -> circumference ~138.23)
    btn.innerHTML =
      '<svg class="back-to-top__ring" viewBox="0 0 48 48" aria-hidden="true">' +
        '<circle class="back-to-top__track" cx="24" cy="24" r="22"></circle>' +
        '<circle class="back-to-top__fill" cx="24" cy="24" r="22"></circle>' +
      '</svg>' +
      '<svg class="back-to-top__icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 7.41 6.7 12.7a1 1 0 1 1-1.4-1.42l6-6a1 1 0 0 1 1.4 0l6 6a1 1 0 1 1-1.4 1.42L12 7.41z"/></svg>';
    btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
    document.body.appendChild(btn);

    const fill = btn.querySelector(".back-to-top__fill");
    const CIRCUMFERENCE = 2 * Math.PI * 22; // ~138.23
    if (fill) {
      fill.style.strokeDasharray = CIRCUMFERENCE.toString();
      fill.style.strokeDashoffset = CIRCUMFERENCE.toString();
    }

    const onScroll = () => {
      btn.classList.toggle("is-visible", window.scrollY > 600);
      if (fill) {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const pct = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
        fill.style.strokeDashoffset = (CIRCUMFERENCE * (1 - pct)).toString();
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }
})();
