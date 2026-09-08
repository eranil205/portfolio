(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Sticky header state */
  var header = document.querySelector(".site-header");
  var onScroll = function () {
    if (window.scrollY > 24) {
      header.classList.add("site-header--scrolled");
    } else {
      header.classList.remove("site-header--scrolled");
    }
  };
  document.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* Mobile nav toggle */
  var navToggle = document.querySelector(".nav-toggle");
  var navPrimary = document.querySelector(".nav-primary");
  var navScrim = document.querySelector(".nav-scrim");

  function closeNav() {
    navPrimary.classList.remove("is-open");
    navScrim.classList.remove("is-visible");
    navToggle.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }
  function openNav() {
    navPrimary.classList.add("is-open");
    navScrim.classList.add("is-visible");
    navToggle.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
  }

  if (navToggle) {
    navToggle.addEventListener("click", function () {
      var isOpen = navPrimary.classList.contains("is-open");
      isOpen ? closeNav() : openNav();
    });
  }
  if (navScrim) navScrim.addEventListener("click", closeNav);
  document.querySelectorAll(".nav-list a").forEach(function (link) {
    link.addEventListener("click", closeNav);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeNav();
  });

  /* Pause decorative hero animations when off-screen (perf + avoids indefinite repaint loops) */
  var heroSection = document.querySelector(".hero");
  if (heroSection && "IntersectionObserver" in window) {
    var heroIo = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          heroSection.classList.toggle("is-in-view", entry.isIntersecting);
        });
      },
      { threshold: 0 }
    );
    heroIo.observe(heroSection);
  } else if (heroSection) {
    heroSection.classList.add("is-in-view");
  }

  /* Scroll reveal */
  var revealEls = document.querySelectorAll(".reveal");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  } else {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* Animated stat counters */
  var counters = document.querySelectorAll("[data-count-to]");
  function animateCounter(el) {
    var target = parseFloat(el.getAttribute("data-count-to"));
    var suffix = el.getAttribute("data-suffix") || "";
    if (reduceMotion) {
      el.textContent = target + suffix;
      return;
    }
    var duration = 1400;
    var start = null;
    function step(ts) {
      if (start === null) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var value = Math.floor(eased * target);
      el.textContent = value + suffix;
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target + suffix;
    }
    requestAnimationFrame(step);
  }
  if (counters.length && "IntersectionObserver" in window) {
    var counterIo = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            counterIo.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach(function (el) { counterIo.observe(el); });
  }

  /* Project filter */
  var filterButtons = document.querySelectorAll(".filter-btn");
  var caseCards = document.querySelectorAll("[data-category]");
  filterButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      filterButtons.forEach(function (b) { b.classList.remove("is-active"); });
      btn.classList.add("is-active");
      var filter = btn.getAttribute("data-filter");
      caseCards.forEach(function (card) {
        var match = filter === "all" || card.getAttribute("data-category") === filter;
        card.style.display = match ? "" : "none";
      });
    });
  });

  /* Contact form (front-end only — wire to a form backend / mail service before going live) */
  var form = document.getElementById("contact-form");
  var status = document.getElementById("form-status");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = form.querySelector("#cf-name").value.trim();
      var email = form.querySelector("#cf-email").value.trim();
      var message = form.querySelector("#cf-message").value.trim();
      var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      status.classList.remove("success", "error", "is-visible");

      if (!name || !email || !message || !emailPattern.test(email)) {
        status.textContent = "Please fill in your name, a valid email address, and a message before sending.";
        status.classList.add("error", "is-visible");
        return;
      }

      status.textContent = "Thanks, " + name.split(" ")[0] + " — your message has been noted. This form is a front-end placeholder; connect it to your email service or form backend to receive live submissions.";
      status.classList.add("success", "is-visible");
      form.reset();
    });
  }

  /* Footer year */
  var yearEl = document.getElementById("current-year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
