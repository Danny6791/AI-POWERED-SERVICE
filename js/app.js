/* ===== SERVICECRAFT — Shared Utilities ===== */

(function () {
  "use strict";

  /* ---- Mobile nav toggle ---- */
  var toggle = document.getElementById("navToggle");
  var links = document.getElementById("navLinks");

  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("open");
      toggle.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open);
    });
    links.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        links.classList.remove("open");
        toggle.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---- Scroll reveal ---- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(function (el) { observer.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---- Smooth scroll for anchor links ---- */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener("click", function (e) {
      var href = this.getAttribute("href");
      if (href === "#" || href === "" || href.length < 2) return;
      var target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        var top = target.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top: top, behavior: "smooth" });
      }
    });
  });

  /* ---- Toast notifications ---- */
  window.showToast = function (msg, type) {
    type = type || "info";
    var c = document.getElementById("toastContainer");
    if (!c) {
      c = document.createElement("div");
      c.id = "toastContainer";
      c.className = "toast-container";
      document.body.appendChild(c);
    }
    var t = document.createElement("div");
    t.className = "toast toast--" + type;
    var iconName = type === "success" ? "ic-check" : type === "error" ? "ic-x" : "ic-bell";
    t.innerHTML = '<svg class="icon" style="flex-shrink:0"><use href="public/icons/icons.svg#' + iconName + '"/></svg> ' + msg;
    c.appendChild(t);
    setTimeout(function () {
      t.classList.add("removing");
      setTimeout(function () { t.remove(); }, 300);
    }, 3500);
  };

  /* ---- SCUtils ---- */
  window.SCUtils = {
    formatDate: function (d) {
      if (!d) return "—";
      var dt = new Date(d);
      return dt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    },
    formatTime: function (d) {
      if (!d) return "";
      var dt = new Date(d);
      return dt.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    },
    statusBadge: function (status) {
      var map = {
        "pending": "badge--pending",
        "in-progress": "badge--progress",
        "completed": "badge--done",
        "cancelled": "badge--cancel",
        "accepted": "badge--done",
        "declined": "badge--cancel"
      };
      var cls = map[status] || "badge--pending";
      var label = status ? status.charAt(0).toUpperCase() + status.slice(1).replace("-", " ") : "Pending";
      return '<span class="badge ' + cls + '">' + label + '</span>';
    }
  };

  /* ---- Dynamic copyright year ---- */
  var yearSpan = document.getElementById("year");
  if (yearSpan) yearSpan.textContent = new Date().getFullYear();

})();
