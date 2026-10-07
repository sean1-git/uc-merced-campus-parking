import {readSnapshot, getDataStatus} from './parking-data.mjs';

const REFRESH_INTERVAL_MS = 60000;
const REQUEST_TIMEOUT_MS = 6000;

function byId(id) {
  return document.getElementById(id);
}
const frame = byId('campus-map');
let updatedAt = null;
let lastCheckedAt = null;
let loading = false;
let dataError = false;
let previousCounts = null;

function showNotice(message) {
  byId('connection').textContent = message;
  byId('connection').hidden = !message;
}

function updateConnectionStatus() {
  const status = getDataStatus({updatedAt, failed: dataError, online: navigator.onLine});
  const statusLabel = byId('data-status');
  statusLabel.dataset.state = status.state;
  if (status.state === 'waiting') {
    statusLabel.hidden = true;
    statusLabel.textContent = '';
  } else {
    statusLabel.hidden = false;
    statusLabel.textContent = status.label;
  }

  if (updatedAt === null) {
    byId('updated').textContent = 'Not received yet';
  } else {
    byId('updated').textContent = new Date(updatedAt).toLocaleString();
  }
  if (lastCheckedAt === null) {
    byId('last-checked').textContent = 'Not yet';
  } else {
    byId('last-checked').textContent = new Date(lastCheckedAt).toLocaleString();
  }
  byId('refresh').hidden = !dataError;
  showNotice(status.message);
}

function renderCounts(lots) {
  const counts = {available: 0, occupied: 0};
  for (const lot of lots) {
    counts.available += lot.available;
    counts.occupied += lot.occupied;
  }

  // Unchanged counts do not need another DOM update.
  if (previousCounts !== null &&
      counts.available === previousCounts.available &&
      counts.occupied === previousCounts.occupied) {
    return;
  }
  byId('total').textContent = counts.available;
  byId('occupied').textContent = counts.occupied;
  previousCounts = counts;
}

async function fetchJson(path) {
  const response = await fetch(path, {
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    cache: 'no-store',
  });
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response.json();
}

async function loadParking() {
  if (loading) {
    return;
  }
  loading = true;
  byId('refresh').disabled = true;
  try {
    const data = await fetchJson('/api/parking');
    const snapshot = readSnapshot(data);
    if (updatedAt !== null && snapshot.updatedAt < updatedAt) {
      throw new Error('Older parking update');
    }
    dataError = false;
    updatedAt = snapshot.updatedAt;
    renderCounts(snapshot.lots);
  } catch {
    dataError = true;
  } finally {
    // A recent check does not imply fresh data or a successful request.
    lastCheckedAt = Date.now();
    loading = false;
    byId('refresh').disabled = false;
    updateConnectionStatus();
  }
}

async function connectMap() {
  try {
    const config = await fetchJson('/api/config');
    if (!config.map_url) {
      return;
    }
    const url = new URL(config.map_url);
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) {
      throw new Error('Use an HTTP(S) map URL');
    }
    frame.src = url.href;
    frame.hidden = false;
    byId('map-placeholder').hidden = true;
  } catch {
    byId('map-placeholder').querySelector('strong').textContent = 'Map unavailable. Parking counts can still update independently.';
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
