/* ===== SERVICECRAFT Auth UI ===== */

(function () {
  "use strict";

  // Seed demo data on first load
  SC.seedDemoData();

  // Update nav based on auth state
  function updateNav() {
    const loggedIn = SC.isLoggedIn();
    const user = SC.currentUser();
    document.querySelectorAll(".auth-show").forEach(el => el.style.display = loggedIn ? "" : "none");
    document.querySelectorAll(".auth-hide").forEach(el => el.style.display = loggedIn ? "none" : "");
    document.querySelectorAll(".auth-name").forEach(el => { if (el) el.textContent = user ? user.name : ""; });
  }

  // --- Login form ---
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = document.getElementById("loginEmail").value.trim();
      const password = document.getElementById("loginPassword").value;
      const msgEl = document.getElementById("loginMsg");

      if (!email || !password) {
        msgEl.textContent = "Please fill in all fields.";
        msgEl.className = "form-msg error"; return;
      }

      const result = SC.login(email, password);
      if (result.ok) {
        msgEl.textContent = "Login successful! Redirecting...";
        msgEl.className = "form-msg success";
        setTimeout(() => { window.location.href = "dashboard.html"; }, 600);
      } else {
        msgEl.textContent = result.msg;
        msgEl.className = "form-msg error";
      }
    });
  }

  // --- Signup form ---
  const signupForm = document.getElementById("signupForm");
  if (signupForm) {
    signupForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("signupName").value.trim();
      const email = document.getElementById("signupEmail").value.trim();
      const password = document.getElementById("signupPassword").value;
      const confirm = document.getElementById("signupConfirm").value;
      const msgEl = document.getElementById("signupMsg");

      if (!name || !email || !password || !confirm) {
        msgEl.textContent = "Please fill in all fields.";
        msgEl.className = "form-msg error"; return;
      }
      if (password.length < 6) {
        msgEl.textContent = "Password must be at least 6 characters.";
        msgEl.className = "form-msg error"; return;
      }
      if (password !== confirm) {
        msgEl.textContent = "Passwords do not match.";
        msgEl.className = "form-msg error"; return;
      }

      const result = SC.signup(name, email, password);
      if (result.ok) {
        msgEl.textContent = "Account created! Redirecting...";
        msgEl.className = "form-msg success";
        setTimeout(() => { window.location.href = "dashboard.html"; }, 600);
      } else {
        msgEl.textContent = result.msg;
        msgEl.className = "form-msg error";
      }
    });
  }

  // --- Logout ---
  document.querySelectorAll(".btn-logout").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      SC.logout();
      window.location.href = "index.html";
    });
  });

  // --- Protected pages ---
  if (document.body.classList.contains("page-protected")) {
    if (!SC.isLoggedIn()) {
      window.location.href = "login.html?redirect=" + encodeURIComponent(window.location.pathname);
    }
  }

  // Init nav on page load
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", updateNav);
  } else {
    updateNav();
  }
})();
