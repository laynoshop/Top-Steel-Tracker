/* login.js
   Handles access-code login for Top Steel Tracker.

   ACCESS CODES:
     Admin code: 1595
     User code:  2026 */

const TS_ACCESS_CODES = {
  "1595": "admin",
  "2026": "user"
};

const TS_SESSION_KEY = "topSteelSession";

function tsAttemptLogin(code) {
  const role = TS_ACCESS_CODES[code.trim()];
  if (!role) return false;
  sessionStorage.setItem(TS_SESSION_KEY, JSON.stringify({ role: role, loggedInAt: Date.now() }));
  return true;
}

function tsGetSession() {
  try {
    const raw = sessionStorage.getItem(TS_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function tsRequireSession() {
  const session = tsGetSession();
  if (!session) {
    window.location.href = "./index.html";
    return null;
  }
  return session;
}

function tsLogout() {
  sessionStorage.removeItem(TS_SESSION_KEY);
  window.location.href = "./index.html";
}

/* Wires up the login page (index.html). */
function tsInitLoginPage() {
  const input   = document.getElementById("pinInput");
  const btn     = document.getElementById("loginBtn");
  const errorEl = document.getElementById("loginError");
  if (!input || !btn) return;

  function attemptLogin() {
    const ok = tsAttemptLogin(input.value);
    if (ok) {
      window.location.href = "./menu.html";
    } else {
      if (errorEl) errorEl.textContent = "Incorrect PIN. Try again.";
      input.value = "";
      input.focus();
    }
  }

  btn.addEventListener("click", attemptLogin);

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") attemptLogin();
  });

  input.addEventListener("input", () => {
    if (errorEl) errorEl.textContent = "";
  });
}

/* Called on every protected page to inject header + check session. */
function tsInitPage(activePage) {
  const session = tsRequireSession();
  if (!session) return;
  const header = document.getElementById("appHeader");
  if (!header) return;
  header.innerHTML =
    '<div class="brand">' +
    '<svg class="brand-mark" viewBox="0 0 48 48" fill="none"><rect width="48" height="48" rx="10" fill="#0a5c8a"/><path d="M10 34V20l14-8 14 8v14" stroke="#fff" stroke-width="2.5" stroke-linejoin="round"/><path d="M18 34v-8h12v8" stroke="#fff" stroke-width="2.5" stroke-linejoin="round"/></svg>' +
    '<div class="brand-text"><span class="brand-title">Top Steel</span><span class="brand-sub">Tracker</span></div>' +
    '</div>' +
    '<div class="header-actions">' +
    '<span class="user-badge">' + session.role + '</span>' +
    '<button class="logout-btn" onclick="tsLogout()">Sign out</button>' +
    '</div>';
}
