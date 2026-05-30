/* SERVICECRAFT Shared Utilities */
(function() {
  "use strict";

  // Mobile nav toggle
  const toggle = document.getElementById("navToggle");
  const links = document.getElementById("navLinks");
  if (toggle && links) {
    toggle.addEventListener("click", () => {
      const open = links.classList.toggle("open");
      toggle.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open);
    });
    links.querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
      links.classList.remove("open"); toggle.classList.remove("open");
    }));
  }

  // Scroll reveal
  if ("IntersectionObserver" in window) {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); obs.unobserve(e.target); } });
    }, { threshold: 0.15 });
    document.querySelectorAll(".reveal").forEach(el => obs.observe(el));
  } else {
    document.querySelectorAll(".reveal").forEach(el => el.classList.add("in"));
  }

  // Smooth scroll
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener("click", function(e) {
      const h = this.getAttribute("href");
      if (h.length < 2) return;
      const t = document.querySelector(h);
      if (t) { e.preventDefault(); window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - 80, behavior: "smooth" }); }
    });
  });

  // Year
  const ys = document.getElementById("year");
  if (ys) ys.textContent = new Date().getFullYear();

  // Toast helper
  window.showToast = function(msg, type) {
    let c = document.getElementById("toastContainer");
    if (!c) { c = document.createElement("div"); c.className = "toast-container"; c.id = "toastContainer"; document.body.appendChild(c); }
    const t = document.createElement("div");
    t.className = "toast toast--" + (type || "info");
    t.innerHTML = '<svg class="icon" style="flex-shrink:0"><use href="public/icons/icons.svg#ic-' + (type === "success" ? "check" : type === "error" ? "x" : "bell") + '"/></svg> ' + msg;
    c.appendChild(t);
    setTimeout(() => t.remove(), 4000);
  };

  // Formatters
  window.SCUtils = {
    formatDate(d) { return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }); },
    statusBadge(s) {
      const m = { pending: ["Pending","badge--pending"], "in-progress": ["In Progress","badge--progress"], completed: ["Completed","badge--done"], cancelled: ["Cancelled","badge--cancel"] };
      const [l, c] = m[s] || [s, ""];
      return '<span class="badge ' + c + '">' + l + '</span>';
    },
    stars(r) {
      let s = "";
      for (let i = 1; i <= 5; i++) s += '<svg class="icon icon--sm" style="color:' + (i <= r ? '#ffc107' : 'var(--muted)') + '"><use href="public/icons/icons.svg#ic-star-filled"/></svg>';
      return s;
    }
  };
})();
