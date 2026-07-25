/* move.js
   3-step flow: pick source (occupied) -> pick destination (open) -> confirm */

function tsInitMovePage() {
  const gridContainer      = document.getElementById("gridContainer");
  const gridHeadingText    = document.getElementById("gridHeadingText");
  const selectedSourceWrap = document.getElementById("selectedSourceWrap");
  const selectedSourceLabel = document.getElementById("selectedSourceLabel");
  const clearSourceBtn     = document.getElementById("clearSourceBtn");
  const step1              = document.getElementById("step1Indicator");
  const step2              = document.getElementById("step2Indicator");
  const step3              = document.getElementById("step3Indicator");
  const confirmOverlay     = document.getElementById("confirmOverlay");
  const confirmFrom        = document.getElementById("confirmFrom");
  const confirmTo          = document.getElementById("confirmTo");
  const confirmDesc        = document.getElementById("confirmDesc");
  const confirmArea        = document.getElementById("confirmArea");

  let sourceLocNum = null;
  let destLocNum   = null;

  function setActiveStep(n) {
    [step1, step2, step3].forEach((el, i) => {
      el.classList.toggle("active", i + 1 === n);
      el.classList.toggle("done",   i + 1 < n);
    });
  }

  // ─ Step 1: show occupied slots ──────────────────────
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

  // ─ Step 2: pick destination (open slots) ─────────────
  function selectSource(locNum) {
    sourceLocNum = locNum;
    const pallet = tsGetPallet(locNum);
    selectedSourceLabel.textContent = "Top Steel #" + locNum + " \u2014 " + (pallet ? pallet.description : "");
    selectedSourceWrap.style.display = "";
    gridHeadingText.textContent = "Now select the destination location";
    setActiveStep(2);

    const pallets = tsGetAllPallets();
    gridContainer.innerHTML = "";

    let hasOpen = false;
    for (let i = 1; i <= TS_TOTAL_LOCATIONS; i++) {
      if (pallets[i]) continue; // skip occupied
      hasOpen = true;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "slot";
      btn.setAttribute("aria-label", "Top Steel location " + i + ", open");
      btn.innerHTML = '<span class="slot-num">' + i + '</span><span class="slot-desc">Open</span>';
      btn.addEventListener("click", () => selectDest(i));
      gridContainer.appendChild(btn);
    }

    if (!hasOpen) {
      gridContainer.innerHTML = '<div class="empty-note"><p>No open locations to move to.</p></div>';
    }
  }

  // ─ Step 3: confirmation modal ──────────────────────
  function selectDest(locNum) {
    destLocNum = locNum;
    const pallet = tsGetPallet(sourceLocNum);
    confirmFrom.textContent = "Top Steel #" + sourceLocNum;
    confirmTo.textContent   = "Top Steel #" + destLocNum;
    confirmDesc.textContent = pallet ? pallet.description : "—";
    confirmArea.textContent = pallet ? (pallet.area || "—") : "—";
    setActiveStep(3);
    confirmOverlay.classList.add("open");
  }

  // ─ Execute move ───────────────────────────────
  function executeMove() {
    const pallet = tsGetPallet(sourceLocNum);
    if (!pallet) { tsShowToast("Source location is empty."); cancelConfirm(); return; }
    if (tsGetPallet(destLocNum)) { tsShowToast("Destination is now occupied. Please try again."); cancelConfirm(); renderStep1(); return; }
    tsSetPallet(destLocNum, pallet);
    tsRemovePallet(sourceLocNum);
    confirmOverlay.classList.remove("open");
    tsShowToast("Moved Top Steel #" + sourceLocNum + " \u2192 #" + destLocNum);
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
