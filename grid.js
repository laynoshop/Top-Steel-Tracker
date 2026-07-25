/* grid.js
   Shared logic for rendering the 214-location grid.
   Used by add.js and remove.js. Each caller passes a mode ("add" or
   "remove") so the grid knows whether to disable open or occupied slots,
   and a callback to run when a slot is clicked. */

function tsRenderLocationGrid(containerId, mode, onSlotClick) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const pallets = tsGetAllPallets();
  container.innerHTML = "";

  let occupiedCount = 0;

  for (let i = 1; i <= TS_TOTAL_LOCATIONS; i++) {
    const p = pallets[i];
    if (p) occupiedCount++;

    const isDisabled = (mode === "remove" && !p);
    const urgent = p && tsIsUrgent(p);

    const slot = document.createElement("button");
    slot.type = "button";
    slot.className = "slot" + (p ? " occupied" : "") + (urgent ? " urgent" : "");
    slot.disabled = isDisabled;
    slot.setAttribute(
      "aria-label",
      "Top Steel location " + i + (p ? ", occupied by " + p.description : ", open") + (urgent ? ", urgent" : "")
    );
    slot.innerHTML =
      '<span class="slot-num">' + i + "</span>" +
      (p
        ? '<span class="slot-desc">' + tsEscapeHtml(p.description || "Pallet") + "</span>"
        : '<span class="slot-desc">Open</span>');

    if (!isDisabled) {
      slot.addEventListener("click", () => onSlotClick(i, p));
    }
    container.appendChild(slot);
  }

  const statOccupied = document.getElementById("statOccupied");
  const statOpen = document.getElementById("statOpen");
  if (statOccupied) statOccupied.textContent = occupiedCount;
  if (statOpen) statOpen.textContent = TS_TOTAL_LOCATIONS - occupiedCount;
}

function tsEscapeHtml(str) {
  const d = document.createElement("div");
  d.textContent = str;
  return d.innerHTML;
}

function tsShowToast(msg) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => toast.classList.remove("show"), 2200);
}
