/* login.js
   Handles access-code login for Top Steel Tracker.
   Access codes are temporary placeholders until real user accounts are
   wired up. Admin code unlocks admin-only actions later (like editing the
   locked date field); normal code is for everyday team use.

   ACCESS CODES (placeholder — replace once real users are set up):
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

/* Wires up the login form on index.html. Called on that page only. */
function tsInitLoginForm() {
  const form = document.getElementById("loginForm");
  const input = document.getElementById("accessCodeInput");
  const errorEl = document.getElementById("loginError");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const ok = tsAttemptLogin(input.value);
    if (ok) {
      window.location.href = "./menu.html";
    } else {
      errorEl.textContent = "Incorrect access code. Try again.";
      input.value = "";
      input.focus();
    }
  });

  input.addEventListener("input", () => {
    errorEl.textContent = "";
  });
}
