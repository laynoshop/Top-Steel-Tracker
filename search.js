/* search.js
   Page-specific logic for the Search page: filtering pallets by
   location number, description, associate, or notes. Relies on
   data.js for storage. */

function tsInitSearchPage() {
  const searchInput = document.getElementById("searchInput");
  const resultsList = document.getElementById("resultsList");
  const statOccupied = document.getElementById("statOccupied");
  const statOpen = document.getElementById("statOpen");

  function renderResults(query) {
    const pallets = tsGetAllPallets();
    const q = (query || "").trim().toLowerCase();
    const entries = Object.keys(pallets)
      .map(Number)
      .sort((a, b) => a - b);

    statOccupied.textContent = entries.length;
    statOpen.textContent = TS_TOTAL_LOCATIONS - entries.length;

    const filtered = entries.filter((locNum) => {
      if (!q) return true;
      const p = pallets[locNum];
      const haystack = [
        String(locNum),
        p.description || "",
        p.associate || "",
        p.notes || ""
      ].join(" ").toLowerCase();
      return haystack.includes(q);
    });

    if (filtered.length === 0) {
      resultsList.innerHTML =
        '<div class="empty-note"><p>' +
        (q ? "No pallets match your search." : "No pallets are currently assigned.") +
        "</p></div>";
      return;
    }

    resultsList.innerHTML = filtered
      .map((locNum) => {
        const p = pallets[locNum];
        return `
          <div class="result-card">
            <div class="result-loc">#${locNum}</div>
            <div class="result-details">
              <div class="result-desc">${tsEscapeHtml(p.description || "Pallet")}</div>
              <div class="result-meta">Added ${tsEscapeHtml(p.date || "")} ${p.associate ? "&middot; " + tsEscapeHtml(p.associate) : ""}</div>
              ${p.notes ? '<div class="result-notes">' + tsEscapeHtml(p.notes) + "</div>" : ""}
            </div>
          </div>
        `;
      })
      .join("");
  }

  searchInput.addEventListener("input", () => renderResults(searchInput.value));
  renderResults("");
}
