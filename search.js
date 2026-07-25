/* search.js */
function tsInitSearchPage() {
  const searchInput    = document.getElementById("searchInput");
  const gridContainer  = document.getElementById("gridContainer");
  const statOccupied   = document.getElementById("statOccupied");
  const statOpen       = document.getElementById("statOpen");
  const btnOccupied    = document.getElementById("filterOccupied");
  const btnOpen        = document.getElementById("filterOpen");

  // Detail modal
  const detailOverlay     = document.getElementById("detailOverlay");
  const detailLocNum      = document.getElementById("detailLocNum");
  const detailDesc        = document.getElementById("detailDescription");
  const detailArea        = document.getElementById("detailArea");
  const detailFreightType = document.getElementById("detailFreightType");
  const detailDate        = document.getElementById("detailDate");
  const detailAssociate   = document.getElementById("detailAssociate");
  const detailNotes       = document.getElementById("detailNotes");
  const detailNotesRow    = document.getElementById("detailNotesRow");
  const detailEditBtn     = document.getElementById("detailEditBtn");

  // Edit modal
  const editOverlay     = document.getElementById("editOverlay");
  const editLocNum      = document.getElementById("editLocNum");
  const editDescription = document.getElementById("editDescription");
  const editArea        = document.getElementById("editArea");
  const editFreightType = document.getElementById("editFreightType");
  const editDate        = document.getElementById("editDate");
  const editAssociate   = document.getElementById("editAssociate");
  const editNotes       = document.getElementById("editNotes");

  const areaFilterBtns    = document.querySelectorAll(".vm-filters-area [data-area]");
  const freightFilterBtns = document.querySelectorAll(".vm-filters-freight [data-freight]");

  const session  = tsGetSession();
  const isAdmin  = session && session.role === "admin";

  let statusFilter   = null;
  let activeAreas    = new Set();
  let activeFreights = new Set();
  let currentLocNum  = null;

  if (isAdmin) detailEditBtn.style.display = "";

  // --- Detail modal ---
  function openDetailModal(locNum, pallet) {
    currentLocNum = locNum;
    detailLocNum.textContent      = locNum;
    detailDesc.textContent        = pallet.description  || "\u2014";
    detailArea.textContent        = pallet.area         || "\u2014";
    detailFreightType.textContent = pallet.freightType  || "\u2014";
    detailDate.textContent        = pallet.date         || "\u2014";
    detailAssociate.textContent   = pallet.associate    || "\u2014";
    if (pallet.notes && pallet.notes.trim()) {
      detailNotes.textContent      = pallet.notes;
      detailNotesRow.style.display = "";
    } else {
      detailNotesRow.style.display = "none";
    }
    detailOverlay.classList.add("open");
  }

  function closeDetailModal() {
    detailOverlay.classList.remove("open");
    currentLocNum = null;
  }

  document.getElementById("detailClose").addEventListener("click", closeDetailModal);
  document.getElementById("detailCloseBtn").addEventListener("click", closeDetailModal);
  detailOverlay.addEventListener("click", (e) => { if (e.target === detailOverlay) closeDetailModal(); });

  // --- Edit modal ---
  function openEditModal() {
    if (!currentLocNum) return;
    const pallet = tsGetPallet(currentLocNum);
    if (!pallet) return;
    editLocNum.textContent    = currentLocNum;
    editDescription.value     = pallet.description  || "";
    editArea.value            = pallet.area         || "";
    editFreightType.value     = pallet.freightType  || "";
    editDate.value            = pallet.date         || tsNowDateTime();
    editAssociate.value       = pallet.associate    || "";
    editNotes.value           = pallet.notes        || "";
    closeDetailModal();
    editOverlay.classList.add("open");
    editDescription.focus();
  }

  function closeEditModal() {
    editOverlay.classList.remove("open");
  }

  function saveEdit() {
    const locNum = parseInt(editLocNum.textContent, 10);
    if (!editDescription.value.trim()) { tsShowToast("Pallet description is required"); return; }
    tsSetPallet(locNum, {
      description:  editDescription.value.trim(),
      area:         editArea.value         || "",
      freightType:  editFreightType.value  || "",
      date:         editDate.value,
      associate:    editAssociate.value.trim(),
      notes:        editNotes.value.trim()
    });
    closeEditModal();
    renderGrid();
    tsShowToast("Location " + locNum + " updated");
  }

  detailEditBtn.addEventListener("click", openEditModal);
  document.getElementById("editClose").addEventListener("click", closeEditModal);
  document.getElementById("editCancelBtn").addEventListener("click", closeEditModal);
  document.getElementById("editSaveBtn").addEventListener("click", saveEdit);
  editOverlay.addEventListener("click", (e) => { if (e.target === editOverlay) closeEditModal(); });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (editOverlay.classList.contains("open")) closeEditModal();
      else if (detailOverlay.classList.contains("open")) closeDetailModal();
    }
  });

  // --- Stats ---
  function updateStats() {
    const count = Object.keys(tsGetAllPallets()).length;
    statOccupied.textContent = count;
    statOpen.textContent = TS_TOTAL_LOCATIONS - count;
  }

  // --- Grid ---
  function renderGrid() {
    const pallets = tsGetAllPallets();
    const query   = (searchInput.value || "").trim().toLowerCase();
    updateStats();

    const slots = [];
    for (let i = 1; i <= TS_TOTAL_LOCATIONS; i++) {
      const pallet   = pallets[i] || null;
      const occupied = !!pallet;
      if (statusFilter === "occupied" && !occupied) continue;
      if (statusFilter === "open"     &&  occupied) continue;
      if (activeAreas.size > 0) {
        const slotArea = pallet ? (pallet.area || "") : "";
        if (!activeAreas.has(slotArea)) continue;
      }
      if (activeFreights.size > 0) {
        const slotFreight = pallet ? (pallet.freightType || "") : "";
        if (!activeFreights.has(slotFreight)) continue;
      }
      if (query) {
        const haystack = [String(i), pallet ? pallet.description : "", pallet ? pallet.associate : "", pallet ? pallet.area : "", pallet ? pallet.freightType : "", pallet ? pallet.notes : ""].join(" ").toLowerCase();
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
      btn.innerHTML = '<span class="slot-num">' + locNum + '</span>' + (pallet ? '<span class="slot-desc">' + tsEscapeHtml(pallet.description || "Pallet") + '</span>' : '<span class="slot-desc">Open</span>');
      if (occupied) btn.addEventListener("click", () => openDetailModal(locNum, pallet));
      gridContainer.appendChild(btn);
    });
  }

  // --- Filters ---
  function setStatusFilter(filter) {
    statusFilter = (statusFilter === filter) ? null : filter;
    btnOccupied.classList.toggle("active", statusFilter === "occupied");
    btnOpen.classList.toggle("active", statusFilter === "open");
    renderGrid();
  }

  areaFilterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const area = btn.dataset.area;
      if (activeAreas.has(area)) { activeAreas.delete(area); btn.classList.remove("active"); }
      else { activeAreas.add(area); btn.classList.add("active"); }
      renderGrid();
    });
  });

  freightFilterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const freight = btn.dataset.freight;
      if (activeFreights.has(freight)) { activeFreights.delete(freight); btn.classList.remove("active"); }
      else { activeFreights.add(freight); btn.classList.add("active"); }
      renderGrid();
    });
  });

  btnOccupied.addEventListener("click", () => setStatusFilter("occupied"));
  btnOpen.addEventListener("click",     () => setStatusFilter("open"));
  searchInput.addEventListener("input",  renderGrid);

  renderGrid();
}
