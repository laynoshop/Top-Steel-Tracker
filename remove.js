/* remove.js
   Page-specific logic for the Remove page: clearing a pallet from an
   occupied Top Steel location. Relies on grid.js for rendering and
   data.js for storage. */

function tsInitRemovePage() {
  const modalOverlay = document.getElementById("modalOverlay");
  const modalLocNum = document.getElementById("modalLocNum");
  const viewDescription = document.getElementById("viewDescription");
  const viewDate = document.getElementById("viewDate");
  const viewAssociate = document.getElementById("viewAssociate");
  const viewNotes = document.getElementById("viewNotes");
  let activeLocation = null;

  function refreshGrid() {
    tsRenderLocationGrid("gridContainer", "remove", openRemoveModal);
  }

  function openRemoveModal(locNum, existingPallet) {
    if (!existingPallet) return;
    activeLocation = locNum;
    modalLocNum.textContent = locNum;
    viewDescription.value = existingPallet.description || "";
    viewDate.value = existingPallet.date || "";
    viewAssociate.value = existingPallet.associate || "";
    viewNotes.value = existingPallet.notes || "";
    modalOverlay.classList.add("open");
  }

  function closeModal() {
    modalOverlay.classList.remove("open");
    activeLocation = null;
  }

  function confirmRemove() {
    if (activeLocation == null) return;
    tsRemovePallet(activeLocation);
    const removedLoc = activeLocation;
    closeModal();
    refreshGrid();
    tsShowToast("Pallet removed from location " + removedLoc);
  }

  document.getElementById("modalClose").addEventListener("click", closeModal);
  document.getElementById("cancelBtn").addEventListener("click", closeModal);
  document.getElementById("confirmRemoveBtn").addEventListener("click", confirmRemove);
  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) closeModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modalOverlay.classList.contains("open")) closeModal();
  });

  refreshGrid();
}
