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

/* Parse stored "MM/DD, H:MM AM/PM" -> Date (assumes current year, rolls back if in future) */
function tsParsePalletDate(str) {
  if (!str) return null;
  try {
    const m = str.match(/(\d{1,2})\/(\d{1,2}),?\s+(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (!m) return null;
    let [, mo, dy, hr, min, ampm] = m;
    hr = parseInt(hr, 10);
    if (ampm.toUpperCase() === "PM" && hr !== 12) hr += 12;
    if (ampm.toUpperCase() === "AM" && hr === 12) hr = 0;
    const now = new Date();
    const d = new Date(now.getFullYear(), parseInt(mo,10)-1, parseInt(dy,10), hr, parseInt(min,10));
    if (d - now > 86400000) d.setFullYear(now.getFullYear() - 1);
    return d;
  } catch(e) { return null; }
}

/* Returns whole days elapsed (floor of full 24-hr cycles) */
function tsDaysInSteel(pallet) {
  const d = tsParsePalletDate(pallet && pallet.date);
  if (!d) return 0;
  return Math.floor((Date.now() - d.getTime()) / 864e5);
}

/* Returns hours elapsed */
function tsHoursInSteel(pallet) {
  const d = tsParsePalletDate(pallet && pallet.date);
  if (!d) return 0;
  return (Date.now() - d.getTime()) / 36e5;
}

/* Returns true if pallet meets urgent criteria */
function tsIsUrgent(pallet) {
  if (!pallet) return false;
  const ft = pallet.freightType || "";
  if (ft === "Mixed Freight" || ft === "Clearance/Deleted") return true;
  if (ft === "Feature" && tsHoursInSteel(pallet) >= 24) return true;
  if (ft === "New Mod" && tsHoursInSteel(pallet) >= 24 * 14) return true;
  return false;
}

/* Human-readable age label e.g. "2 days in top steel" */
function tsDaysLabel(pallet) {
  const days = tsDaysInSteel(pallet);
  if (days === 0) return "less than 1 day in top steel";
  return days + (days === 1 ? " day" : " days") + " in top steel";
}
