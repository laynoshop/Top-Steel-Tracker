/* add.js */
function tsInitAddPage() {
  const modalOverlay      = document.getElementById("modalOverlay");
  const modalLocNum       = document.getElementById("modalLocNum");
  const fieldDescription  = document.getElementById("fieldDescription");
  const fieldArea         = document.getElementById("fieldArea");
  const fieldFreightType  = document.getElementById("fieldFreightType");
  const fieldDate         = document.getElementById("fieldDate");
  const fieldAssociate    = document.getElementById("fieldAssociate");
  const fieldNotes        = document.getElementById("fieldNotes");

  const warnFeature   = document.getElementById("warnFeature");
  const warnNewMod    = document.getElementById("warnNewMod");
  const warnMixed     = document.getElementById("warnMixed");
  const warnClearance = document.getElementById("warnClearance");

  const warnings = {
    "Feature":           warnFeature,
    "New Mod":           warnNewMod,
    "Mixed Freight":     warnMixed,
    "Clearance/Deleted": warnClearance
  };

  let activeLocation = null;

  const session = tsGetSession();
  const isAdmin = session && session.role === "admin";
  fieldDate.disabled = !isAdmin;

  function hideAllWarnings() {
    Object.values(warnings).forEach(el => el.style.display = "none");
  }

  fieldFreightType.addEventListener("change", () => {
    hideAllWarnings();
    const w = warnings[fieldFreightType.value];
    if (w) w.style.display = "";
  });

  function refreshGrid() {
    tsRenderLocationGrid("gridContainer", "add", openAddModal);
    const count = Object.keys(tsGetAllPallets()).length;
    document.getElementById("statOccupied").textContent = count;
    document.getElementById("statOpen").textContent = TS_TOTAL_LOCATIONS - count;
  }

  function openAddModal(locNum, existingPallet) {
    if (existingPallet) {
      tsShowToast("Location " + locNum + " is already occupied. Use Remove first.");
      return;
    }
    activeLocation = locNum;
    modalLocNum.textContent = locNum;
    fieldDescription.value  = "";
    fieldArea.value         = "";
    fieldFreightType.value  = "";
    fieldDate.value         = tsNowDateTime();
    fieldAssociate.value    = "";
    fieldNotes.value        = "";
    hideAllWarnings();
    modalOverlay.classList.add("open");
    fieldDescription.focus();
  }

  function closeModal() {
    modalOverlay.classList.remove("open");
    activeLocation = null;
  }

  function saveNewPallet() {
    if (!activeLocation) { tsShowToast("No location selected."); return; }
    if (tsGetPallet(activeLocation)) { tsShowToast("Location " + activeLocation + " is already occupied"); return; }
    if (!fieldDescription.value.trim()) { tsShowToast("Pallet description is required"); return; }
    tsSetPallet(activeLocation, {
      description:  fieldDescription.value.trim(),
      area:         fieldArea.value || "",
      freightType:  fieldFreightType.value || "",
      date:         fieldDate.value,
      associate:    fieldAssociate.value.trim(),
      notes:        fieldNotes.value.trim()
    });
    closeModal();
    refreshGrid();
    tsShowToast("Pallet added to location " + activeLocation);
  }

  document.getElementById("modalClose").addEventListener("click", closeModal);
  document.getElementById("cancelBtn").addEventListener("click", closeModal);
  document.getElementById("saveBtn").addEventListener("click", saveNewPallet);
  modalOverlay.addEventListener("click", (e) => { if (e.target === modalOverlay) closeModal(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && modalOverlay.classList.contains("open")) closeModal(); });

  refreshGrid();
}
