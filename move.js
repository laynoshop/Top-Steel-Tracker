/* move.js
   3-step flow: pick source (occupied) -> pick any other location -> confirm move or swap */

function tsInitMovePage() {
  const gridContainer       = document.getElementById("gridContainer");
  const gridHeadingText     = document.getElementById("gridHeadingText");
  const selectedSourceWrap  = document.getElementById("selectedSourceWrap");
  const selectedSourceLabel = document.getElementById("selectedSourceLabel");
  const clearSourceBtn      = document.getElementById("clearSourceBtn");
  const step1               = document.getElementById("step1Indicator");
  const step2               = document.getElementById("step2Indicator");
  const step3               = document.getElementById("step3Indicator");
  const confirmOverlay      = document.getElementById("confirmOverlay");
  const confirmTitle        = document.getElementById("confirmTitle");
  const confirmFrom         = document.getElementById("confirmFrom");
  const confirmTo           = document.getElementById("confirmTo");
  const confirmDesc         = document.getElementById("confirmDesc");
  const confirmArea         = document.getElementById("confirmArea");
  const confirmToDesc       = document.getElementById("confirmToDesc");
  const confirmToRow        = document.getElementById("confirmToRow");

  let sourceLocNum = null;
  let destLocNum   = null;

  function setActiveStep(n) {
    [step1, step2, step3].forEach((el, i) => {
      el.classList.toggle("active", i + 1 === n);
      el.classList.toggle("done",   i + 1 < n);
    });
  }

  // --- Step 1: show only occupied slots ---
  function renderStep1() {
    sourceLocNum = null;
    destLocNum   = null;
    selectedSourceWrap.style.display = "none";
    gridHeadingText.textContent = "Select the location you want to move";
    setActiveStep(1);

    const pallets = tsGetAllPallets();
    gridContainer.innerHTML = "";
    let hasOccupied = false;

    for (let i = 1; i <= TS_TOTAL_LOCATIONS; i++) {
      const pallet = pallets[i];
      if (!pallet) continue;
      hasOccupied = true;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "slot occupied";
      btn.setAttribute("aria-label", "Top Steel location " + i + ", occupied");
      btn.innerHTML = '<span class="slot-num">' + i + '</span><span class="slot-desc">' + tsEscapeHtml(pallet.description || "Pallet") + '</span>';
      btn.addEventListener("click", () => selectSource(i));
      gridContainer.appendChild(btn);
    }

    if (!hasOccupied) {
      gridContainer.innerHTML = '<div class="empty-note"><p>No occupied locations to move.</p></div>';
    }
  }

  // --- Step 2: show ALL locations except the source ---
  function selectSource(locNum) {
    sourceLocNum = locNum;
    const pallet = tsGetPallet(locNum);
    selectedSourceLabel.textContent = "Top Steel #" + locNum + " \u2014 " + (pallet ? pallet.description : "");
    selectedSourceWrap.style.display = "";
    gridHeadingText.textContent = "Select a destination (open or occupied \u2014 occupied spots will be swapped)";
    setActiveStep(2);

    const pallets = tsGetAllPallets();
    gridContainer.innerHTML = "";

    for (let i = 1; i <= TS_TOTAL_LOCATIONS; i++) {
      if (i === sourceLocNum) continue; // skip the source itself
      const pallet  = pallets[i] || null;
      const occupied = !!pallet;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "slot" + (occupied ? " occupied" : "");
      btn.setAttribute("aria-label", "Top Steel location " + i + (occupied ? ", occupied" : ", open"));
      btn.innerHTML = '<span class="slot-num">' + i + '</span><span class="slot-desc">' + (pallet ? tsEscapeHtml(pallet.description || "Pallet") : "Open") + '</span>';
      btn.addEventListener("click", () => selectDest(i));
      gridContainer.appendChild(btn);
    }
  }

  // --- Step 3: confirmation modal ---
  function selectDest(locNum) {
    destLocNum = locNum;
    const srcPallet  = tsGetPallet(sourceLocNum);
    const destPallet = tsGetPallet(destLocNum);
    const isSwap     = !!destPallet;

    confirmTitle.textContent = isSwap ? "Confirm Swap" : "Confirm Move";
    confirmFrom.textContent  = "Top Steel #" + sourceLocNum;
    confirmTo.textContent    = "Top Steel #" + destLocNum;
    confirmDesc.textContent  = srcPallet ? srcPallet.description : "\u2014";
    confirmArea.textContent  = srcPallet ? (srcPallet.area || "\u2014") : "\u2014";

    if (isSwap) {
      confirmToDesc.textContent    = destPallet.description + (destPallet.area ? " (" + destPallet.area + ")" : "");
      confirmToRow.style.display   = "";
    } else {
      confirmToRow.style.display   = "none";
    }

    setActiveStep(3);
    confirmOverlay.classList.add("open");
  }

  // --- Execute move or swap ---
  function executeMove() {
    const srcPallet  = tsGetPallet(sourceLocNum);
    const destPallet = tsGetPallet(destLocNum);

    if (!srcPallet) {
      tsShowToast("Source location is empty. Please start over.");
      cancelConfirm();
      renderStep1();
      return;
    }

    if (destPallet) {
      // Swap: put dest into source, src into dest
      tsSetPallet(sourceLocNum, destPallet);
      tsSetPallet(destLocNum, srcPallet);
      confirmOverlay.classList.remove("open");
      tsShowToast("Swapped Top Steel #" + sourceLocNum + " \u21c4 #" + destLocNum);
    } else {
      // Simple move
      tsSetPallet(destLocNum, srcPallet);
      tsRemovePallet(sourceLocNum);
      confirmOverlay.classList.remove("open");
      tsShowToast("Moved Top Steel #" + sourceLocNum + " \u2192 #" + destLocNum);
    }

    renderStep1();
  }

  function cancelConfirm() {
    confirmOverlay.classList.remove("open");
    setActiveStep(2);
  }

  clearSourceBtn.addEventListener("click", renderStep1);
  document.getElementById("confirmMoveBtn").addEventListener("click", executeMove);
  document.getElementById("confirmCancelBtn").addEventListener("click", cancelConfirm);
  confirmOverlay.addEventListener("click", (e) => { if (e.target === confirmOverlay) cancelConfirm(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && confirmOverlay.classList.contains("open")) cancelConfirm(); });

  renderStep1();
}
