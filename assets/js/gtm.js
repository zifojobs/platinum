/* Google Tag Manager loader — container GTM-WNQ6KGSP (SEO team, 2026-08-07).

   Google ships this as an inline <script>. It lives in a file instead because the
   site sends a strict Content-Security-Policy: script-src is 'self' plus the
   googletagmanager host, with no 'unsafe-inline' and no nonce, so the inline form
   would be refused by the browser before it ever reached Google. Served from our
   own origin it loads under 'self' and the policy stays untouched.

   Consequence to keep in mind when tags are configured in the GTM interface:
   Custom HTML tags inject inline script and will be blocked by the same policy.
   The built-in templates, GA4 Configuration included, are unaffected. */
(function (w, d, s, l, i) {
  w[l] = w[l] || [];
  w[l].push({ "gtm.start": new Date().getTime(), event: "gtm.js" });
  const f = d.getElementsByTagName(s)[0];
  const j = d.createElement(s);
  const dl = l != "dataLayer" ? "&l=" + l : "";
  j.async = true;
  j.src = "https://www.googletagmanager.com/gtm.js?id=" + i + dl;
  f.parentNode.insertBefore(j, f);
})(window, document, "script", "dataLayer", "GTM-WNQ6KGSP");
