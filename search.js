/* search.js
   View/Manage Top Steel: full grid view with search bar,
   Occupied / Open quick-filter buttons, and a detail modal
   that shows all pallet data when an occupied slot is clicked. */

function tsInitSearchPage() {
  const searchInput   = document.getElementById("searchInput");
  const gridContainer = document.getElementById("gridContainer");
  const statOccupied  = document.getElementById("statOccupied");
  const statOpen      = document.getElementById("statOpen");
  const btnOccupied   = document.getElementById("filterOccupied");
  const btnOpen       = document.getElementById("filterOpen");

  // Detail modal elements
  const detailOverlay   = document.getElementById("detailOverlay");
  const detailLocNum    = document.getElementById("detailLocNum");
  const detailDesc      = document.getElementById("detailDescription");
  const detailArea      = document.getElementById("detailArea");
  const detailDate      = document.getElementById("detailDate");
  const detailAssociate = document.getElementById("detailAssociate");
  const detailNotes     = document.getElementById("detailNotes");
  const detailNotesRow  = document.getElementById("detailNotesRow");

  let activeFilter = null; // null | "occupied" | "open"

  // ── Detail modal ──────────────────────────────────────────────
  function openDetailModal(locNum, pallet) {
    detailLocNum.textContent    = locNum;
    detailDesc.textContent      = pallet.description || "—";
    detailArea.textContent      = pallet.area        || "—";
    detailDate.textContent      = pallet.date        || "—";
    detailAssociate.textContent = pallet.associate   || "—";
    if (pallet.notes && pallet.notes.trim()) {
      detailNotes.textContent   = pallet.notes;
      detailNotesRow.style.display = "";
    } else {
      detailNotesRow.style.display = "none";
    }
    detailOverlay.classList.add("open");
  }

  function closeDetailModal() {
    detailOverlay.classList.remove("open");
  }

  document.getElementById("detailClose").addEventListener("click", closeDetailModal);
  document.getElementById("detailCloseBtn").addEventListener("click", closeDetailModal);
  detailOverlay.addEventListener("click", (e) => { if (e.target === detailOverlay) closeDetailModal(); });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && detailOverlay.classList.contains("open")) closeDetailModal();
  });

  // ── Stats ─────────────────────────────────────────────────────
  function updateStats() {
    const pallets = tsGetAllPallets();
    const count = Object.keys(pallets).length;
    statOccupied.textContent = count;
    statOpen.textContent = TS_TOTAL_LOCATIONS - count;
  }

  // ── Grid render ───────────────────────────────────────────────
  function renderGrid() {
    const pallets = tsGetAllPallets();
    const query   = (searchInput.value || "").trim().toLowerCase();
    updateStats();

    const slots = [];
    for (let i = 1; i <= TS_TOTAL_LOCATIONS; i++) {
      const pallet   = pallets[i] || null;
      const occupied = !!pallet;

      if (activeFilter === "occupied" && !occupied) continue;
      if (activeFilter === "open"     &&  occupied) continue;

      if (query) {
        const haystack = [
          String(i),
          pallet ? (pallet.description || "") : "",
          pallet ? (pallet.associate   || "") : "",
          pallet ? (pallet.area        || "") : "",
          pallet ? (pallet.notes       || "") : ""
        ].join(" ").toLowerCase();
        if (!haystack.includes(query)) continue;
      }

      slots.push({ locNum: i, pallet });
    }

    if (slots.length === 0) {
      gridContainer.innerHTML = '<div class="empty-note"><p>No locations match your search or filter.</p></div>';
      return;
    }

    gridContainer.innerHTML = "";
    slots.forEach(({ locNum, pallet }) => {
      const occupied = !!pallet;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "slot" + (occupied ? " occupied" : "");
      btn.setAttribute("aria-label", "Top Steel location " + locNum + (occupied ? ", occupied" : ", open"));
      btn.innerHTML =
        '<span class="slot-num">' + locNum + "</span>" +
        (pallet
          ? '<span class="slot-desc">' + tsEscapeHtml(pallet.description || "Pallet") + "</span>"
          : '<span class="slot-desc">Open</span>');

      if (occupied) {
        btn.addEventListener("click", () => openDetailModal(locNum, pallet));
      }
      gridContainer.appendChild(btn);
    });
  }

  // ── Filters ───────────────────────────────────────────────────
  function setFilter(filter) {
    activeFilter = (activeFilter === filter) ? null : filter;
    btnOccupied.classList.toggle("active", activeFilter === "occupied");
    btnOpen.classList.toggle("active", activeFilter === "open");
    renderGrid();
  }

  btnOccupied.addEventListener("click", () => setFilter("occupied"));
  btnOpen.addEventListener("click",     () => setFilter("open"));
  searchInput.addEventListener("input",  renderGrid);

  renderGrid();
}
