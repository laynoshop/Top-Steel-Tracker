/* data.js
   Shared data layer for Top Steel Tracker.
   Right now this uses localStorage as a stand-in "database" so that the
   Add, Remove, and Search pages all read/write the same pallet records.
   This file is the ONLY place that should change when we wire up Firebase —
   every page calls these functions instead of touching storage directly. */

const TS_TOTAL_LOCATIONS = 214;
const TS_STORAGE_KEY = "topSteelPallets";

function tsLoadPallets() {
  try {
    const raw = localStorage.getItem(TS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.error("Failed to load pallets", e);
    return {};
  }
}

function tsSavePallets(pallets) {
  try {
    localStorage.setItem(TS_STORAGE_KEY, JSON.stringify(pallets));
  } catch (e) {
    console.error("Failed to save pallets", e);
  }
}

function tsGetPallet(locationNum) {
  const pallets = tsLoadPallets();
  return pallets[locationNum] || null;
}

function tsSetPallet(locationNum, pallet) {
  const pallets = tsLoadPallets();
  pallets[locationNum] = pallet;
  tsSavePallets(pallets);
}

function tsRemovePallet(locationNum) {
  const pallets = tsLoadPallets();
  delete pallets[locationNum];
  tsSavePallets(pallets);
}

function tsGetAllPallets() {
  return tsLoadPallets();
}

function tsTodayMMDD() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return mm + "/" + dd;
}
