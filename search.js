/* search.js
   View/Manage Top Steel: full grid view with search bar and
   Occupied / Open quick-filter buttons. */

function tsInitSearchPage() {
  const searchInput    = document.getElementById("searchInput");
  const gridContainer  = document.getElementById("gridContainer");
  const statOccupied   = document.getElementById("statOccupied");
  const statOpen       = document.getElementById("statOpen");
  const btnOccupied    = document.getElementById("filterOccupied");
  const btnOpen        = document.getElementById("filterOpen");

  let activeFilter = null; // null | "occupied" | "open"

  function updateStats() {
    const pallets = tsGetAllPallets();
    const count = Object.keys(pallets).length;
    statOccupied.textContent = count;
    statOpen.textContent = TS_TOTAL_LOCATIONS - count;
  }

  function renderGrid() {
    const pallets = tsGetAllPallets();
    const query   = (searchInput.value || "").trim().toLowerCase();
    updateStats();

    const slots = [];
    for (let i = 1; i <= TS_TOTAL_LOCATIONS; i++) {
      const pallet  = pallets[i] || null;
      const occupied = !!pallet;

      // Filter by quick-filter button
      if (activeFilter === "occupied" && !occupied) continue;
      if (activeFilter === "open"     &&  occupied) continue;

      // Filter by search query
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

    gridContainer.innerHTML = slots.map(({ locNum, pallet }) => {
      const occupied = !!pallet;
      const desc = pallet ? tsEscapeHtml(pallet.description || "") : "";
      return `
        <div class="slot${occupied ? " occupied" : ""}" data-loc="${locNum}">
          <span class="slot-num">${locNum}</span>
          ${desc ? `<span class="slot-desc">${desc}</span>` : ""}
        </div>
      `;
    }).join("");
  }

  function setFilter(filter) {
    if (activeFilter === filter) {
      // toggle off
      activeFilter = null;
      btnOccupied.classList.remove("active");
      btnOpen.classList.remove("active");
    } else {
      activeFilter = filter;
      btnOccupied.classList.toggle("active", filter === "occupied");
      btnOpen.classList.toggle("active", filter === "open");
    }
    renderGrid();
  }

  btnOccupied.addEventListener("click", () => setFilter("occupied"));
  btnOpen.addEventListener("click",     () => setFilter("open"));
  searchInput.addEventListener("input",  renderGrid);

  renderGrid();
}
