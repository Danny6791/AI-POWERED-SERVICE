/* SERVICECRAFT Auth */
(function() {
  "use strict";
  SC.restore();

  function updateNav() {
    const logged = SC.isLoggedIn();
    document.querySelectorAll(".auth-show").forEach(el => el.style.display = logged ? "" : "none");
    document.querySelectorAll(".auth-hide").forEach(el => el.style.display = logged ? "none" : "");
    document.querySelectorAll(".auth-name").forEach(el => el.textContent = SC.userName());
  }

  const lf = document.getElementById("loginForm");
  if (lf) lf.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value.trim();
    const pw = document.getElementById("loginPassword").value;
    const msg = document.getElementById("loginMsg");
    if (!email || !pw) { msg.textContent = "Fill all fields"; msg.className = "form-msg error"; return; }
    msg.textContent = "Signing in..."; msg.className = "form-msg info";
    const r = await SC.login(email, pw);
    if (r.ok) { msg.textContent = "Welcome!"; msg.className = "form-msg success"; setTimeout(() => location.href = "dashboard.html", 600); }
    else { msg.textContent = r.msg; msg.className = "form-msg error"; }
  });

  const sf = document.getElementById("signupForm");
  if (sf) sf.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("signupName").value.trim();
    const email = document.getElementById("signupEmail").value.trim();
    const pw = document.getElementById("signupPassword").value;
    const confirm = document.getElementById("signupConfirm").value;
    const msg = document.getElementById("signupMsg");
    if (!name || !email || !pw || !confirm) { msg.textContent = "Fill all fields"; msg.className = "form-msg error"; return; }
    if (pw.length < 6) { msg.textContent = "Password min 6 chars"; msg.className = "form-msg error"; return; }
    if (pw !== confirm) { msg.textContent = "Passwords don't match"; msg.className = "form-msg error"; return; }
    msg.textContent = "Creating account..."; msg.className = "form-msg info";
    const r = await SC.signup(email, pw, name);
    if (r.ok) { msg.textContent = "Account created!"; msg.className = "form-msg success"; setTimeout(() => location.href = "dashboard.html", 600); }
    else { msg.textContent = r.msg; msg.className = "form-msg error"; }
  });

  document.querySelectorAll("#googleLoginBtn").forEach(btn => {
    btn.addEventListener("click", async () => { btn.disabled = true; btn.textContent = "Redirecting..."; await SC.loginWithGoogle(); });
  });

  document.querySelectorAll(".btn-logout").forEach(btn => {
    btn.addEventListener("click", async (e) => { e.preventDefault(); await SC.logout(); location.href = "index.html"; });
  });

  if (document.body.classList.contains("page-protected") && !SC.isLoggedIn()) location.href = "login.html";
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", updateNav);
  else updateNav();
})();
