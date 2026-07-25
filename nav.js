/* nav.js
   Renders the bottom navigation bar (Add / Remove / Search) that appears
   across every interior page, plus the shared page header with the
   user role badge and logout link. `activePage` should be one of:
   "menu", "add", "remove", "search". */

function tsRenderHeader(containerId, activePage) {
  const session = tsGetSession();
  const roleLabel = session && session.role === "admin" ? "Admin" : "User";
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `
    <div class="brand">
      <svg class="brand-mark" viewBox="0 0 40 40" fill="none" aria-label="Top Steel Tracker logo">
        <rect x="3" y="3" width="34" height="34" rx="6" fill="var(--color-primary)"/>
        <path d="M11 27V13h4.2l4.1 8.6L23.4 13H27.6V27H23.9V18.9L20.3 27H18L14.7 18.9V27Z" fill="var(--color-text-inverse)"/>
      </svg>
      <div class="brand-text">
        <span class="brand-title">Top Steel Tracker</span>
        <span class="brand-sub">Backroom pallet locations</span>
      </div>
    </div>
    <div class="header-actions">
      <span class="user-badge">${roleLabel}</span>
      <button class="logout-btn" id="logoutBtn" type="button">Log out</button>
      <button class="theme-toggle" id="themeToggle" aria-label="Switch to dark mode">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
      </button>
    </div>
  `;

  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) logoutBtn.addEventListener("click", tsLogout);
}

function tsRenderBottomNav(containerId, activePage) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const links = [
    { key: "add", href: "./add.html", label: "Add", icon: '<path d="M12 5v14M5 12h14"/>' },
    { key: "remove", href: "./remove.html", label: "Remove", icon: '<path d="M5 12h14"/>' },
    { key: "search", href: "./search.html", label: "Search", icon: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>' }
  ];

  container.innerHTML = `
    <nav class="bottom-nav" aria-label="Page navigation">
      <div class="bottom-nav-inner">
        ${links.map(l => `
          <a class="nav-link${activePage === l.key ? " active" : ""}" href="${l.href}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${l.icon}</svg>
            <span>${l.label}</span>
          </a>
        `).join("")}
      </div>
    </nav>
  `;
}

/* Call this once per interior page to set up header + nav + theme + auth guard. */
function tsInitPage(activePage) {
  const session = tsRequireSession();
  if (!session) return null;
  tsRenderHeader("appHeader", activePage);
  tsRenderBottomNav("bottomNav", activePage);
  tsInitTheme();
  return session;
}
