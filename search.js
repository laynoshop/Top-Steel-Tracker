/* search.js
   View/Manage Top Steel: full grid view with search bar,
   status quick-filters (Occupied/Open), multi-select area filters,
   and a detail modal showing all pallet data on click. */

function tsInitSearchPage() {
  const searchInput   = document.getElementById("searchInput");
  const gridContainer = document.getElementById("gridContainer");
  const statOccupied  = document.getElementById("statOccupied");
  const statOpen      = document.getElementById("statOpen");
  const btnOccupied   = document.getElementById("filterOccupied");
  const btnOpen       = document.getElementById("filterOpen");

  // Detail modal
  const detailOverlay   = document.getElementById("detailOverlay");
  const detailLocNum    = document.getElementById("detailLocNum");
  const detailDesc      = document.getElementById("detailDescription");
  const detailArea      = document.getElementById("detailArea");
  const detailDate      = document.getElementById("detailDate");
  const detailAssociate = document.getElementById("detailAssociate");
  const detailNotes     = document.getElementById("detailNotes");
  const detailNotesRow  = document.getElementById("detailNotesRow");

  // Area filter buttons (multi-select)
  const areaFilterBtns = document.querySelectorAll(".vm-filters-area [data-area]");

  let statusFilter  = null;  // null | "occupied" | "open"
  let activeAreas   = new Set(); // empty = no area filter

  // ── Detail modal ──────────────────────────────────────────
  function openDetailModal(locNum, pallet) {
    detailLocNum.textContent    = locNum;
    detailDesc.textContent      = pallet.description || "—";
    detailArea.textContent      = pallet.area        || "—";
    detailDate.textContent      = pallet.date        || "—";
    detailAssociate.textContent = pallet.associate   || "—";
    if (pallet.notes && pallet.notes.trim()) {
      detailNotes.textContent      = pallet.notes;
      detailNotesRow.style.display = "";
    } else {
      detailNotesRow.style.display = "none";
    }
    detailOverlay.classList.add("open");
  }

  function closeDetailModal() { detailOverlay.classList.remove("open"); }

  document.getElementById("detailClose").addEventListener("click", closeDetailModal);
  document.getElementById("detailCloseBtn").addEventListener("click", closeDetailModal);
  detailOverlay.addEventListener("click", (e) => { if (e.target === detailOverlay) closeDetailModal(); });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && detailOverlay.classList.contains("open")) closeDetailModal();
  });

  // ── Stats ─────────────────────────────────────────────────
  function updateStats() {
    const count = Object.keys(tsGetAllPallets()).length;
    statOccupied.textContent = count;
    statOpen.textContent = TS_TOTAL_LOCATIONS - count;
  }

  // ── Grid render ───────────────────────────────────────────
  function renderGrid() {
    const pallets = tsGetAllPallets();
    const query   = (searchInput.value || "").trim().toLowerCase();
    updateStats();

    const slots = [];
    for (let i = 1; i <= TS_TOTAL_LOCATIONS; i++) {
      const pallet   = pallets[i] || null;
      const occupied = !!pallet;

      // Status filter
      if (statusFilter === "occupied" && !occupied) continue;
      if (statusFilter === "open"     &&  occupied) continue;

      // Area filter (multi-select) — only applies to occupied slots
      if (activeAreas.size > 0) {
        const slotArea = pallet ? (pallet.area || "") : "";
        if (!activeAreas.has(slotArea)) continue;
      }

      // Text search
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
      if (occupied) btn.addEventListener("click", () => openDetailModal(locNum, pallet));
      gridContainer.appendChild(btn);
    });
  }

  // ── Status filter (single-select toggle) ──────────────────
  function setStatusFilter(filter) {
    statusFilter = (statusFilter === filter) ? null : filter;
    btnOccupied.classList.toggle("active", statusFilter === "occupied");
    btnOpen.classList.toggle("active", statusFilter === "open");
    renderGrid();
  }

  // ── Area filter (multi-select toggle) ─────────────────────
  areaFilterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const area = btn.dataset.area;
      if (activeAreas.has(area)) {
        activeAreas.delete(area);
        btn.classList.remove("active");
      } else {
        activeAreas.add(area);
        btn.classList.add("active");
      }
      renderGrid();
    });
  });

  btnOccupied.addEventListener("click", () => setStatusFilter("occupied"));
  btnOpen.addEventListener("click",     () => setStatusFilter("open"));
  searchInput.addEventListener("input",  renderGrid);

  renderGrid();
}
