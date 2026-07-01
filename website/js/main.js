/* センター薬局 — interactions */
(function () {
  "use strict";

  var header = document.getElementById("header");
  var nav = document.getElementById("nav");
  var toggle = document.getElementById("navToggle");
  var toTop = document.getElementById("toTop");

  var heroVeil = document.getElementById("heroVeil");

  /* ---- Header shadow + back-to-top + hero veil on scroll ---- */
  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (header) header.classList.toggle("scrolled", y > 8);
    if (toTop) toTop.classList.toggle("show", y > 600);

    /* スクロールが進むほど店舗写真を暗くして、重なる情報の文字を見やすくする */
    if (heroVeil) {
      var vh = window.innerHeight || 800;
      var t = (y - vh * 0.10) / (vh * 0.62);
      t = t < 0 ? 0 : t > 1 ? 1 : t;
      heroVeil.style.opacity = (t * 0.68).toFixed(3);
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
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
    ".hero-copy, .hero-card, .section-head, .feature-card, .payment-copy, .payment-visual, .home-cta-copy, .home-cta-visual, .news-list, .hours-table-wrap, .access-info, .access-map"
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
