/* ===== Nexus AI — Main Script ===== */

(function () {
  "use strict";

  // === 1. Hero chat bubbles ===
  const chatBody = document.getElementById("chatBody");
  const chatMessages = [
    { type: "bot", text: "👋 Hi! I'm Nexus. How can I help you today?" },
    { type: "user", text: "Can you summarize our Q3 sales?" },
    { type: "bot", text: "Sure! Q3 revenue grew 34% YoY to $2.4M. Top product: Pro plan (+62%). Want a full report?" },
  ];

  function showChatSequence() {
    if (!chatBody) return;
    chatBody.innerHTML = "";
    chatMessages.forEach((msg, i) => {
      const div = document.createElement("div");
      div.className = `bubble bubble--${msg.type}`;
      div.textContent = msg.text;
      div.style.animationDelay = `${i * 0.8}s`;
      chatBody.appendChild(div);
    });
  }
  showChatSequence();

  // === 2. Mobile nav toggle ===
  const toggle = document.getElementById("navToggle");
  const links = document.getElementById("navLinks");

  if (toggle && links) {
    toggle.addEventListener("click", () => {
      const open = links.classList.toggle("open");
      toggle.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open);
    });

    // Close nav on link click
    links.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => {
        links.classList.remove("open");
        toggle.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // === 3. Scroll reveal ===
  const revealEls = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18 }
    );
    revealEls.forEach((el) => observer.observe(el));
  } else {
    // Fallback
    revealEls.forEach((el) => el.classList.add("in"));
  }

  // === 4. Counter animation ===
  const counters = document.querySelectorAll("[data-count]");

  function animateCounters() {
    counters.forEach((el) => {
      const target = parseInt(el.dataset.count, 10);
      const duration = 1800;
      const start = performance.now();

      function update(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        // Ease-out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(eased * target);
        if (progress < 1) requestAnimationFrame(update);
        else el.textContent = target;
      }
      requestAnimationFrame(update);
    });
  }

  // Run counters when hero is revealed
  const heroCopy = document.querySelector(".hero__copy");
  if (heroCopy && "IntersectionObserver" in window) {
    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounters();
            counterObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    counterObserver.observe(heroCopy);
  } else {
    animateCounters();
  }

  // === 5. Demo form ===
  const demoForm = document.getElementById("demoForm");
  const demoInput = document.getElementById("demoInput");
  const demoOutput = document.getElementById("demoOutput");

  const aiResponses = [
    "📊 Here's your summary: Revenue up 28% month-over-month. Top channels: Email (42%) and Social (31%).",
    "✅ Task complete! I've drafted a report and sent it to your Slack #reports channel.",
    "🤔 Interesting question. Based on your data, I'd recommend focusing on Q4 retention campaigns. Want me to draft a plan?",
    "📈 Here's the forecast: projected growth of 22% next quarter. I'll keep monitoring and alert you of any changes.",
    "🎯 I've analyzed 1,247 customer feedback entries. Top themes: speed (35%), UX (28%), and pricing (19%).",
    "✨ Done! Your weekly newsletter draft is ready. It includes 3 curated articles and a personalized intro.",
  ];

  if (demoForm && demoInput && demoOutput) {
    demoForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const query = demoInput.value.trim();
      if (!query) return;

      // Show loading state
      demoOutput.innerHTML =
        '<div class="out">⏳ Nexus is thinking…</div>';

      // Simulate AI delay
      setTimeout(() => {
        const reply =
          aiResponses[Math.floor(Math.random() * aiResponses.length)];
        demoOutput.innerHTML = `<div class="out">🤖 <strong>Nexus:</strong> ${reply}</div>`;
      }, 800 + Math.random() * 700);

      demoInput.value = "";
    });
  }

  // === 6. Dynamic copyright year ===
  const yearSpan = document.getElementById("year");
  if (yearSpan) yearSpan.textContent = new Date().getFullYear();

  // === 7. Smooth scroll for anchor links (no-JS fallback) ===
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const href = this.getAttribute("href");
      if (href === "#" || href === "") return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const offset = 80; // sticky nav height
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: "smooth" });
      }
    });
  });
})();
