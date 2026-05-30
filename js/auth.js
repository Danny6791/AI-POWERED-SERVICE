/* ===== SERVICECRAFT — Auth Logic ===== */

(function () {
  "use strict";

  /* ---- Restore session on page load ---- */
  SC.restore();

  /* ---- Nav state update ---- */
  function updateNavState() {
    var isLoggedIn = SC.isLoggedIn();
    document.querySelectorAll(".auth-hide").forEach(function (el) {
      el.style.display = isLoggedIn ? "none" : "";
    });
    document.querySelectorAll(".auth-show").forEach(function (el) {
      el.style.display = isLoggedIn ? "" : "none";
    });
    document.querySelectorAll(".auth-name").forEach(function (el) {
      el.textContent = SC.userName();
    });
  }
  updateNavState();

  /* ---- Protected page check ---- */
  if (document.body.classList.contains("page-protected") && !SC.isLoggedIn()) {
    window.location.href = "login.html";
    return;
  }

  /* ---- Login form handler ---- */
  var loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      var email = document.getElementById("loginEmail").value.trim();
      var password = document.getElementById("loginPassword").value;
      var msgEl = document.getElementById("loginMsg");
      var btn = loginForm.querySelector('button[type="submit"]');

      if (!email || !password) {
        msgEl.textContent = "Please fill in all fields";
        msgEl.className = "form-msg error";
        return;
      }

      btn.disabled = true;
      btn.textContent = "Logging in…";
      msgEl.className = "form-msg";

      try {
        var result = await SC.login(email, password);
        if (result.ok) {
          msgEl.className = "form-msg success";
          msgEl.textContent = "Login successful! Redirecting…";
          updateNavState();
          setTimeout(function () { window.location.href = "dashboard.html"; }, 600);
        } else {
          msgEl.textContent = result.msg || "Login failed";
          msgEl.className = "form-msg error";
        }
      } catch (err) {
        msgEl.textContent = "Network error. Please try again.";
        msgEl.className = "form-msg error";
      }

      btn.disabled = false;
      btn.textContent = "Login →";
    });
  }

  /* ---- Signup form handler ---- */
  var signupForm = document.getElementById("signupForm");
  if (signupForm) {
    signupForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      var name = document.getElementById("signupName").value.trim();
      var email = document.getElementById("signupEmail").value.trim();
      var password = document.getElementById("signupPassword").value;
      var confirm = document.getElementById("signupConfirm").value;
      var msgEl = document.getElementById("signupMsg");
      var btn = signupForm.querySelector('button[type="submit"]');

      if (!name || !email || !password) {
        msgEl.textContent = "Please fill in all fields";
        msgEl.className = "form-msg error";
        return;
      }
      if (password.length < 6) {
        msgEl.textContent = "Password must be at least 6 characters";
        msgEl.className = "form-msg error";
        return;
      }
      if (password !== confirm) {
        msgEl.textContent = "Passwords do not match";
        msgEl.className = "form-msg error";
        return;
      }

      btn.disabled = true;
      btn.textContent = "Creating account…";
      msgEl.className = "form-msg";

      try {
        var result = await SC.signup(email, password, name);
        if (result.ok) {
          msgEl.className = "form-msg success";
          msgEl.textContent = "Account created! Redirecting…";
          updateNavState();
          setTimeout(function () { window.location.href = "dashboard.html"; }, 600);
        } else {
          msgEl.textContent = result.msg || "Signup failed";
          msgEl.className = "form-msg error";
        }
      } catch (err) {
        msgEl.textContent = "Network error. Please try again.";
        msgEl.className = "form-msg error";
      }

      btn.disabled = false;
      btn.textContent = "Create Account →";
    });
  }

  /* ---- Google login button ---- */
  var googleBtn = document.getElementById("googleLoginBtn");
  if (googleBtn) {
    googleBtn.addEventListener("click", async function () {
      var msgEl = document.getElementById("loginMsg") || document.getElementById("signupMsg");
      googleBtn.disabled = true;
      if (msgEl) {
        msgEl.textContent = "Redirecting to Google…";
        msgEl.className = "form-msg info";
      }
      try {
        var result = await SC.loginWithGoogle();
        if (!result.ok && msgEl) {
          msgEl.textContent = result.msg || "Google login failed";
          msgEl.className = "form-msg error";
        }
      } catch (err) {
        if (msgEl) {
          msgEl.textContent = "Google auth failed. Please try again.";
          msgEl.className = "form-msg error";
        }
      }
      googleBtn.disabled = false;
    });
  }

  /* ---- Logout handler ---- */
  document.querySelectorAll(".btn-logout").forEach(function (btn) {
    btn.addEventListener("click", async function (e) {
      e.preventDefault();
      await SC.logout();
      window.location.href = "index.html";
    });
  });

})();
