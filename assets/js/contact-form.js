/* Contact form — AJAX submit to Web3Forms with inline status feedback.
   Externalised from contact.html so a strict CSP (script-src 'self', no
   'unsafe-inline') can be applied site-wide. */
(function () {
  var form = document.getElementById("contactForm");
  if (!form) return;
  var status = document.getElementById("formStatus");
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var btn = form.querySelector('button[type="submit"]');
    if (status) { status.style.display = "block"; status.style.color = "#8c8c8c"; status.textContent = "Sending…"; }
    if (btn) btn.disabled = true;
    fetch("https://api.web3forms.com/submit", { method: "POST", body: new FormData(form) })
      .then(function (r) { return r.json(); })
      .then(function (json) {
        if (json.success) {
          form.reset();
          if (status) { status.style.color = "#1a7f37"; status.textContent = "Thanks — your message has been sent. We'll get back to you shortly."; }
        } else {
          if (status) { status.style.color = "#b42318"; status.textContent = "Something went wrong. Please email us directly at info@platinumconstruction.com."; }
        }
      })
      .catch(function () {
        if (status) { status.style.color = "#b42318"; status.textContent = "Network error. Please email us directly at info@platinumconstruction.com."; }
      })
      .finally(function () { if (btn) btn.disabled = false; });
  });
})();
