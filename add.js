/* add.js
   Page-specific logic for the Add page: assigning a pallet to an open
   Top Steel location. Relies on grid.js for rendering and data.js for
   storage. */

function tsInitAddPage() {
  const modalOverlay = document.getElementById("modalOverlay");
  const modalLocNum = document.getElementById("modalLocNum");
  const fieldLocation = document.getElementById("fieldLocation");
  const fieldDescription = document.getElementById("fieldDescription");
  const fieldArea = document.getElementById("fieldArea");
  const fieldDate = document.getElementById("fieldDate");
  const fieldAssociate = document.getElementById("fieldAssociate");
  const fieldNotes = document.getElementById("fieldNotes");
  let activeLocation = null;

  function refreshGrid() {
    tsRenderLocationGrid("gridContainer", "add", openAddModal);
  }

  function openAddModal(locNum, existingPallet) {
    if (existingPallet) {
      tsShowToast("Location " + locNum + " is already occupied. Use Remove first.");
      return;
    }
    activeLocation = locNum;
    modalLocNum.textContent = locNum;
    fieldLocation.value = locNum;
    fieldDescription.value = "";
    fieldArea.value = "";
    fieldDate.value = tsTodayMMDD();
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
    const locVal = parseInt(fieldLocation.value, 10);
    if (!locVal || locVal < 1 || locVal > TS_TOTAL_LOCATIONS) {
      tsShowToast("Enter a valid Top Steel # between 1 and " + TS_TOTAL_LOCATIONS);
      return;
    }
    if (tsGetPallet(locVal)) {
      tsShowToast("Location " + locVal + " is already occupied");
      return;
    }
    if (!fieldDescription.value.trim()) {
      tsShowToast("Pallet description is required");
      return;
    }

    tsSetPallet(locVal, {
      description: fieldDescription.value.trim(),
      area: fieldArea.value || "",
      date: fieldDate.value,
      associate: fieldAssociate.value.trim(),
      notes: fieldNotes.value.trim()
    });

    closeModal();
    refreshGrid();
    tsShowToast("Pallet added to location " + locVal);
  }

  document.getElementById("modalClose").addEventListener("click", closeModal);
  document.getElementById("cancelBtn").addEventListener("click", closeModal);
  document.getElementById("saveBtn").addEventListener("click", saveNewPallet);
  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) closeModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modalOverlay.classList.contains("open")) closeModal();
  });
  fieldLocation.addEventListener("input", () => {
    fieldLocation.value = fieldLocation.value.replace(/[^0-9]/g, "");
  });

  refreshGrid();
}
