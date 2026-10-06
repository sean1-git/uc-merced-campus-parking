import {readSnapshot} from './parking-data.mjs';

const REFRESH_INTERVAL_MS = 10000;
const REQUEST_TIMEOUT_MS = 6000;
const STALE_AFTER_MS = 60000;

const byId = (id) => document.getElementById(id);
const frame = byId('campus-map');
let lots = [];
let selectedLotId = null;
let updatedAt = null;
let loading = false;
let dataError = false;

function showNotice(message) {
  byId('connection').textContent = message;
  byId('connection').hidden = !message;
}

function updateFreshness() {
  if (updatedAt === null) return;
  const stale = !navigator.onLine || dataError || Date.now() - updatedAt > STALE_AFTER_MS;
  byId('data-status').textContent = stale ? 'Last reported counts' : 'Receiving data';
  byId('updated').textContent = `Reported ${new Date(updatedAt).toLocaleString()}`;
  if (!dataError) showNotice(stale ? 'These counts may be outdated. Waiting for a new parking update.' : '');
}

function selectLot(id) {
  selectedLotId = id;
  const lot = lots.find((item) => item.id === id);
  byId('detail').hidden = !lot;
  document.querySelectorAll('.lot-card').forEach((card) => {
    card.setAttribute('aria-pressed', String(card.dataset.lot === id));
  });
  if (!lot) return;
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
  card.addEventListener('click', () => selectLot(lot.id));
  return card;
}

function renderDashboard() {
  byId('total').textContent = lots.reduce((sum, lot) => sum + lot.available, 0);
  byId('occupied').textContent = lots.reduce((sum, lot) => sum + lot.occupied, 0);
  byId('lot-count').textContent = `${lots.length} lots`;
  byId('lots').replaceChildren(...lots.map(createLotCard));
  if (!lots.length) byId('lots').textContent = 'The file reports no parking lots.';

  const selectedLotExists = lots.some((lot) => lot.id === selectedLotId);
  selectLot(selectedLotExists ? selectedLotId : lots[0]?.id);
  updateFreshness();
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
    lots = snapshot.lots;
    updatedAt = snapshot.updatedAt;
    renderDashboard();
  } catch {
    dataError = true;
    byId('data-status').textContent = updatedAt === null ? 'Waiting for data' : 'Last reported counts';
    showNotice(updatedAt === null
      ? 'Waiting for a valid parking data file. Retrying automatically.'
      : 'Could not update parking data. Displayed counts may be outdated. Retrying automatically.');
  } finally {
    loading = false;
    byId('refresh').disabled = false;
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
  updateFreshness();
  showNotice('You are offline. Any displayed parking counts may be outdated.');
});
window.addEventListener('online', () => {
  loadParking();
  connectMap();
});
setInterval(() => {
  updateFreshness();
  loadParking();
}, REFRESH_INTERVAL_MS);
loadParking();
connectMap();
