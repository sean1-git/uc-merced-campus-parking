// Dashboard data and lot selection. Offline/install code lives in pwa.js.
const elements = {
  total: document.getElementById('total'),
  openLots: document.getElementById('open-lots'),
  closest: document.getElementById('closest'),
  closestWalk: document.getElementById('closest-walk'),
  lotCount: document.getElementById('lot-count'),
  lots: document.getElementById('lots'),
  mapPins: document.getElementById('map-pins'),
  detail: document.getElementById('detail'),
  updated: document.getElementById('updated'),
  connection: document.getElementById('connection'),
  refresh: document.getElementById('refresh'),
};

let lots = [];
let selectedLotId = 'north';
let isLoading = false;
let saveAfterLoading = false;

function getAvailabilityStatus(lot) {
  if (lot.available === 0) return 'full';
  if (lot.available / lot.capacity <= 0.15) return 'limited';
  return 'available';
}

function updateSummary() {
  const availableLots = lots.filter((lot) => lot.available > 0);
  const closestLot = availableLots.sort((a, b) => a.walk - b.walk)[0];

  elements.total.textContent = lots.reduce((total, lot) => total + lot.available, 0);
  elements.openLots.textContent = `${availableLots.length} / ${lots.length}`;
  elements.lotCount.textContent = `${lots.length} lots`;
  elements.closest.textContent = closestLot ? closestLot.name : 'All lots full';
  elements.closestWalk.textContent = closestLot
    ? `${closestLot.walk} min walk to campus center`
    : 'Check again later';
}

function createLotCard(lot) {
  const template = document.getElementById('lot-card-template');
  const card = template.content.firstElementChild.cloneNode(true);
  const status = getAvailabilityStatus(lot);
  const statusLabel = status.charAt(0).toUpperCase() + status.slice(1);

  card.dataset.lot = lot.id;
  card.setAttribute('aria-label', `${lot.name}, ${lot.available} spaces available, ${statusLabel}`);
  card.querySelector('.lot-title').textContent = lot.name;
  card.querySelector('.lot-zone').textContent = lot.zone;
  card.querySelector('.lot-count').classList.add(status);
  card.querySelector('strong').textContent = lot.available;
  card.querySelector('.status-label').textContent = statusLabel;
  card.addEventListener('click', () => selectLot(lot.id));
  return card;
}

function createMapPin(lot) {
  const template = document.getElementById('map-pin-template');
  const pin = template.content.firstElementChild.cloneNode(true);

  pin.dataset.lot = lot.id;
  pin.classList.add(`pin-${lot.id}`, getAvailabilityStatus(lot));
  pin.setAttribute('aria-label', `Select ${lot.name}, ${lot.available} available`);
  pin.querySelector('span').textContent = lot.name.replace(' Lot', '');
  pin.querySelector('strong').textContent = lot.available;
  pin.addEventListener('click', () => selectLot(lot.id));
  return pin;
}

function selectLot(lotId) {
  const lot = lots.find((item) => item.id === lotId);
  if (!lot) return;
  selectedLotId = lotId;

  // The list and map always show the same selection.
  document.querySelectorAll('[data-lot]').forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.lot === lotId));
  });

  elements.detail.hidden = false;
  document.getElementById('detail-name').textContent = lot.name;
  document.getElementById('detail-walk').textContent = `${lot.walk} min walk`;
  document.getElementById('detail-count').textContent = `${lot.available} of ${lot.capacity}`;
  document.getElementById('detail-note').textContent = lot.available > 0
    ? 'Estimated walk to campus center.'
    : 'This lot is full. Choose another lot.';

  const meter = document.getElementById('detail-meter');
  meter.setAttribute('aria-label', `${lot.name} available spaces`);
  meter.setAttribute('aria-valuemax', lot.capacity);
  meter.setAttribute('aria-valuenow', lot.available);
  meter.firstElementChild.style.width = `${lot.available / lot.capacity * 100}%`;
}

function renderDashboard() {
  updateSummary();
  elements.lots.replaceChildren(...lots.map(createLotCard));
  elements.mapPins.replaceChildren(...lots.map(createMapPin));
  selectLot(selectedLotId);
}

function showConnectionMessage(message) {
  elements.connection.textContent = message;
  elements.connection.hidden = !message;
}

async function loadLots() {
  if (isLoading) return;
  isLoading = true;
  elements.refresh.disabled = true;

  try {
    const response = await fetch('/api/lots', {
      signal: AbortSignal.timeout(6000),
    });
    if (!response.ok) throw new Error('Could not load parking counts');

    const data = await response.json();
    lots = data.lots;
    renderDashboard();

    const isSavedData = response.headers.get('X-Parking-Offline') === '1';
    const time = new Date(data.updated_at).toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
    });
    elements.updated.textContent = `${isSavedData ? 'Saved' : 'Updated'} ${time}`;
    showConnectionMessage(isSavedData ? 'Offline. Saved counts may be out of date.' : '');
  } catch {
    showConnectionMessage(lots.length
      ? 'Could not refresh. Showing the previous counts.'
      : 'Could not load parking counts. Check your connection and try again.');
    if (!lots.length) elements.lots.textContent = 'No parking data available.';
    elements.updated.textContent = 'Unable to update';
  } finally {
    isLoading = false;
    elements.refresh.disabled = false;
    if (saveAfterLoading) {
      saveAfterLoading = false;
      loadLots();
    }
  }
}

elements.refresh.addEventListener('click', loadLots);
window.addEventListener('online', loadLots);
window.addEventListener('offline', () => {
  showConnectionMessage(lots.length
    ? 'Offline. Saved counts may be out of date.'
    : 'Offline. Connect to load parking counts.');
});

// Load immediately; save a fresh response once offline support is ready.
window.addEventListener('parking-offline-ready', () => {
  if (isLoading) saveAfterLoading = true;
  else loadLots();
});
loadLots();

