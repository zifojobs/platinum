/* Click-to-play facades on the Videos page.
   Nothing from YouTube is requested until a visitor actually presses play —
   the cards are local thumbnails until then. */
(function () {
  var buttons = document.querySelectorAll(".video-play");
  if (!buttons.length) return;

  buttons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var card = btn.closest(".video-card");
      var thumb = btn.closest(".video-thumb");
      if (!card || !thumb || card.classList.contains("is-playing")) return;

      var id = card.getAttribute("data-video");
      var titleEl = card.querySelector(".video-title");
      if (!id) return;

      var frame = document.createElement("iframe");
      frame.src = "https://www.youtube-nocookie.com/embed/" + id + "?autoplay=1&rel=0";
      frame.title = titleEl ? titleEl.textContent : "Platinum Construction video";
      frame.setAttribute("allow", "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share");
      frame.setAttribute("allowfullscreen", "");
      frame.setAttribute("loading", "lazy");

      thumb.innerHTML = "";
      thumb.appendChild(frame);
      card.classList.add("is-playing");
    });
  });
})();
