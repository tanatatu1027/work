/* センター薬局 — interactions */
(function () {
  "use strict";

  var header = document.getElementById("header");
  var nav = document.getElementById("nav");
  var toggle = document.getElementById("navToggle");
  var toTop = document.getElementById("toTop");

  /* ---- Header shadow + back-to-top on scroll ---- */
  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (header) header.classList.toggle("scrolled", y > 8);
    if (toTop) toTop.classList.toggle("show", y > 600);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---- Mobile menu ---- */
  function closeMenu() {
    if (!nav || !toggle) return;
    nav.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "メニューを開く");
  }
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "メニューを閉じる" : "メニューを開く");
    });
    nav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", closeMenu);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeMenu();
    });
  }

  /* ---- Reveal on scroll ---- */
  var targets = document.querySelectorAll(
    ".section-head, .feature-card, .payment-copy, .payment-visual, .home-cta-copy, .home-cta-visual, .news-list, .hours-table-wrap, .access-info, .access-map"
  );
  targets.forEach(function (el) { el.classList.add("reveal"); });

  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry, i) {
        if (entry.isIntersecting) {
          // slight stagger for cards
          var delay = entry.target.classList.contains("feature-card") ? (i % 3) * 80 : 0;
          setTimeout(function () { entry.target.classList.add("in"); }, delay);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    targets.forEach(function (el) { io.observe(el); });
  } else {
    targets.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---- Current year ---- */
  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
})();
