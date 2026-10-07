import {readSnapshot, getDataStatus} from './parking-data.mjs';

const REFRESH_INTERVAL_MS = 60000;
const REQUEST_TIMEOUT_MS = 6000;
const SELECTED_LOT_KEY = 'campus-parking-selected-lot';

const byId = (id) => document.getElementById(id);
const frame = byId('campus-map');
let lots = [];
let preferredLotId = readPreferredLot();
let updatedAt = null;
let lastCheckedAt = null;
let loading = false;
let dataError = false;
let previousLotsJson = null;

function readPreferredLot() {
  try {
    return localStorage.getItem(SELECTED_LOT_KEY);
  } catch {
    // Selection still works if browser storage is disabled.
    return null;
  }
}

function rememberLot(id) {
  preferredLotId = id;
  try {
    localStorage.setItem(SELECTED_LOT_KEY, id);
  } catch {
    // Keep the preference for this visit when it cannot be saved.
  }
}

function showNotice(message) {
  byId('connection').textContent = message;
  byId('connection').hidden = !message;
}

function updateConnectionStatus() {
  const status = getDataStatus({updatedAt, failed: dataError, online: navigator.onLine});
  byId('data-status').textContent = status.label;
  byId('data-status').dataset.state = status.state;
  byId('updated').textContent = updatedAt === null
    ? 'No parking data received yet'
    : `Data reported ${new Date(updatedAt).toLocaleString()}`;
  byId('last-checked').textContent = lastCheckedAt === null
    ? 'Last checked: not yet'
    : `Last checked ${new Date(lastCheckedAt).toLocaleString()}`;
  showNotice(status.message);
}

function selectLot(id, remember = false) {
  const lot = lots.find((item) => item.id === id);
  byId('detail').hidden = !lot;
  document.querySelectorAll('.lot-card').forEach((card) => {
    card.setAttribute('aria-pressed', String(card.dataset.lot === id));
  });
  if (!lot) return;
  if (remember) rememberLot(id);
  byId('detail-name').textContent = lot.name;
  byId('detail-count').textContent = lot.available;
  byId('detail-note').textContent = `${lot.occupied} occupied · ${lot.capacity} total spaces`;
  const meter = byId('detail-meter');
  meter.setAttribute('aria-valuemax', String(Math.max(1, lot.capacity)));
  meter.setAttribute('aria-valuenow', String(lot.available));
  meter.firstElementChild.style.width = `${lot.capacity ? lot.available / lot.capacity * 100 : 0}%`;
}

function createLotCard(lot) {
  const card = byId('lot-card-template').content.firstElementChild.cloneNode(true);
  card.dataset.lot = lot.id;
  card.querySelector('.lot-title').textContent = lot.name;
  card.querySelector('.lot-zone').textContent = `${lot.occupied} occupied`;
  card.querySelector('strong').textContent = lot.available;
  card.querySelector('.status-label').textContent = 'available';
  card.querySelector('.lot-count').classList.toggle('available', lot.available > 0);
  card.addEventListener('click', () => selectLot(lot.id, true));
  return card;
}

function renderDashboard() {
  byId('total').textContent = lots.reduce((sum, lot) => sum + lot.available, 0);
  byId('occupied').textContent = lots.reduce((sum, lot) => sum + lot.occupied, 0);
  byId('lot-count').textContent = `${lots.length} lots`;
  byId('lots').replaceChildren(...lots.map(createLotCard));
  if (!lots.length) byId('lots').textContent = 'The file reports no parking lots.';

  // A temporary empty file or missing lot must not erase the saved preference.
  const preferredLotExists = lots.some((lot) => lot.id === preferredLotId);
  selectLot(preferredLotExists ? preferredLotId : lots[0]?.id);
}

async function fetchJson(path) {
  const response = await fetch(path, {
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    cache: 'no-store',
  });
  if (!response.ok) throw new Error(`Request failed: ${response.status}`);
  return response.json();
}

async function loadParking() {
  if (loading) return;
  loading = true;
  byId('refresh').disabled = true;
  try {
    const snapshot = readSnapshot(await fetchJson('/api/parking'));
    if (updatedAt !== null && snapshot.updatedAt < updatedAt) {
      throw new Error('Older parking update');
    }
    dataError = false;
    const lotsJson = JSON.stringify(snapshot.lots);
    updatedAt = snapshot.updatedAt;
    // Keep the current lot buttons and selection when the counts have not changed.
    if (lotsJson !== previousLotsJson) {
      lots = snapshot.lots;
      previousLotsJson = lotsJson;
      renderDashboard();
    }
  } catch {
    dataError = true;
  } finally {
    // Record completed attempts, even if the file is missing or unchanged.
    lastCheckedAt = Date.now();
    loading = false;
    byId('refresh').disabled = false;
    updateConnectionStatus();
  }
}

async function connectMap() {
  try {
    const config = await fetchJson('/api/config');
    if (!config.map_url) return;
    const url = new URL(config.map_url);
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) {
      throw new Error('Use an HTTP(S) map URL');
    }
    frame.src = url.href;
    frame.hidden = false;
    byId('map-placeholder').hidden = true;
  } catch {
    byId('map-placeholder').querySelector('p').textContent = 'Map unavailable. Parking counts can still update independently.';
  }
}

byId('refresh').addEventListener('click', loadParking);
window.addEventListener('offline', () => {
  dataError = true;
  updateConnectionStatus();
});
window.addEventListener('online', () => {
  loadParking();
  connectMap();
});
setInterval(() => {
  updateConnectionStatus();
  loadParking();
}, REFRESH_INTERVAL_MS);
updateConnectionStatus();
loadParking();
connectMap();
