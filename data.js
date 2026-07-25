/* data.js
   Shared data layer for Top Steel Tracker. */

const TS_TOTAL_LOCATIONS = 214;
const TS_STORAGE_KEY = "topSteelPallets";

function tsLoadPallets() {
  try {
    const raw = localStorage.getItem(TS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) { return {}; }
}

function tsSavePallets(pallets) {
  try {
    localStorage.setItem(TS_STORAGE_KEY, JSON.stringify(pallets));
  } catch (e) { console.error("Failed to save pallets", e); }
}

function tsGetPallet(locationNum) {
  return tsLoadPallets()[locationNum] || null;
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

/* Returns current date+time as "MM/DD, HH:MM AM/PM" */
function tsNowDateTime() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return mm + "/" + dd + ", " + hours + ":" + minutes + " " + ampm;
}

/* Legacy alias */
function tsTodayMMDD() { return tsNowDateTime(); }

function tsEscapeHtml(str) {
  return String(str).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}
