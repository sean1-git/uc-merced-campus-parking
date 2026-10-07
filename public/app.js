import {readSnapshot} from './parking-data.mjs';

const REFRESH_INTERVAL_MS = 1000;
const MAP_REFRESH_INTERVAL_MS = 60000;
const REQUEST_TIMEOUT_MS = 6000;

function byId(id) {
  return document.getElementById(id);
}
const frame = byId('campus-map');
let updatedAt = null;
let loading = false;
let previousCounts = null;

function showNotice(message) {
  byId('connection').textContent = message;
  byId('connection').hidden = !message;
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
  try {
    const data = await fetchJson('/api/parking');
    const snapshot = readSnapshot(data);
    if (updatedAt !== null && snapshot.updatedAt < updatedAt) {
      throw new Error('Older parking update');
    }
    showNotice('');
    updatedAt = snapshot.updatedAt;
    renderCounts(snapshot.lots);
  } catch {
    // Hide old counts rather than presenting them as current after a failed check.
    byId('total').textContent = '\u2014';
    byId('occupied').textContent = '\u2014';
    previousCounts = null;
    showNotice('Parking counts unavailable. Retrying automatically.');
  } finally {
    loading = false;
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

// The iframe owns its map; reloading it does not change the dashboard counts.
setInterval(connectMap, MAP_REFRESH_INTERVAL_MS);
setInterval(loadParking, REFRESH_INTERVAL_MS);
loadParking();
connectMap();
