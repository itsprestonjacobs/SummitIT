/* ============================================================
   Summit IT — main.js
   Nav, header behavior, contact details, footer year.
   ============================================================ */
(function () {
  "use strict";

  var CONFIG = window.SUMMIT_CONFIG || {};

  /* ---- mobile nav toggle ---- */
  var toggle = document.getElementById("navToggle");
  var nav = document.getElementById("primaryNav");

  function closeNav() {
    if (!nav) return;
    nav.classList.remove("is-open");
    if (toggle) toggle.setAttribute("aria-expanded", "false");
    if (toggle) toggle.setAttribute("aria-label", "Open menu");
  }

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    // close menu after tapping a link
    nav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", closeNav);
    });
  }

  /* ---- header shadow on scroll ---- */
  var header = document.getElementById("siteHeader");
  function onScroll() {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 6);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---- populate contact details from config ---- */
  var b = CONFIG.business || {};
  var phoneEl = document.getElementById("contact-phone");
  var emailEl = document.getElementById("contact-email");
  var hoursEl = document.getElementById("contact-hours");
  var areaEl = document.getElementById("contact-area");

  if (phoneEl && b.phone) {
    phoneEl.textContent = b.phone;
    phoneEl.href = "tel:" + b.phone.replace(/[^\d+]/g, "");
  }
  if (emailEl && b.email) {
    emailEl.textContent = b.email;
    emailEl.href = "mailto:" + b.email;
  }
  if (hoursEl && b.hours) hoursEl.textContent = b.hours;
  if (areaEl && b.serviceArea) areaEl.textContent = b.serviceArea;

  /* ---- footer year ---- */
  var yr = document.getElementById("year");
  if (yr) yr.textContent = String(new Date().getFullYear());
})();
