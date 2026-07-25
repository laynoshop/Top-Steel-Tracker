/* add.js */
function tsInitAddPage() {
  const modalOverlay     = document.getElementById("modalOverlay");
  const modalLocNum      = document.getElementById("modalLocNum");
  const fieldDescription = document.getElementById("fieldDescription");
  const fieldArea        = document.getElementById("fieldArea");
  const fieldDate        = document.getElementById("fieldDate");
  const fieldAssociate   = document.getElementById("fieldAssociate");
  const fieldNotes       = document.getElementById("fieldNotes");
  let activeLocation = null;

  const session = tsGetSession();
  const isAdmin = session && session.role === "admin";

  // Date field: editable for admin, locked for users
  fieldDate.disabled = !isAdmin;

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
    fieldDescription.value = "";
    fieldArea.value = "";
    fieldDate.value = tsNowDateTime();
    fieldAssociate.value = "";
    fieldNotes.value = "";
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
      description: fieldDescription.value.trim(),
      area:        fieldArea.value || "",
      date:        fieldDate.value,
      associate:   fieldAssociate.value.trim(),
      notes:       fieldNotes.value.trim()
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
