import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {readSnapshot, getDataStatus} from './public/parking-data.mjs';

const now = Date.now();
const snapshot = () => ({updated_at: new Date(now).toISOString(), lots: [
  {id: 'a', name: 'Lot A', spaces: [
    {id: '1', status: 'available'}, {id: '2', status: 'occupied'}
  ]},
  {id: 'b', name: 'Lot B', spaces: []}
]});

test('counts available and occupied spaces without inventing availability', () => {
  assert.deepEqual(readSnapshot(snapshot(), now).lots, [
    {id: 'a', name: 'Lot A', capacity: 2, available: 1, occupied: 1},
    {id: 'b', name: 'Lot B', capacity: 0, available: 0, occupied: 0}
  ]);
});

test('rejects malformed snapshots rather than displaying partial counts', () => {
  const changes = [
    (s) => s.lots.push(s.lots[0]),
    (s) => s.lots[0].spaces.push(s.lots[0].spaces[0]),
    (s) => s.lots[0].spaces[0].status = 'green',
    (s) => s.lots[0].spaces[0].status = 'unknown',
    (s) => s.updated_at = 'invalid',
    (s) => s.updated_at = new Date(now + 60000).toISOString(),
    (s) => s.lots[0].name = null,
    (s) => s.lots[0].spaces = null
  ];
  for (const change of changes) {
    const data = snapshot();
    change(data);
    assert.throws(() => readSnapshot(data, now));
  }
});

test('distinguishes first load, failed refresh, and old data', () => {
  const status = (values) => getDataStatus({updatedAt: null, failed: false, online: true, now, ...values});
  assert.equal(status({}).state, 'waiting');
  assert.equal(status({failed: true}).state, 'waiting');
  assert.equal(status({online: false}).state, 'waiting');
  assert.equal(status({updatedAt: now, failed: true}).state, 'failed');
  assert.equal(status({updatedAt: now, online: false}).state, 'failed');
  assert.equal(status({updatedAt: now - 60001}).state, 'outdated');
  assert.equal(status({updatedAt: now - 60000}).state, 'current');
});

test('recovery uses the observation time, even when counts are unchanged', () => {
  const old = now - 120000;
  assert.equal(getDataStatus({updatedAt: old, failed: true, online: true, now}).state, 'failed');
  assert.equal(getDataStatus({updatedAt: old, failed: false, online: true, now}).state, 'outdated');
  assert.equal(getDataStatus({updatedAt: now, failed: false, online: true, now}).state, 'current');
});

// Exercise the dashboard selection across page sessions without a live data file.
function selectionPage(storage, globals = {}) {
  const nodes = new Map();
  function element(id) {
    if (!nodes.has(id)) nodes.set(id, {
      dataset: {}, firstElementChild: {style: {}},
      setAttribute() {}, replaceChildren() {},
    });
    return nodes.get(id);
  }
  const context = vm.createContext({
    localStorage: storage,
    document: {getElementById: element, querySelectorAll: () => []},
    navigator: {onLine: true}, getDataStatus, readSnapshot, ...globals,
  });
  const source = readFileSync(new URL('./public/app.js', import.meta.url), 'utf8');
  // Startup requests are outside this selection test.
  const functions = source.slice(source.indexOf('const REFRESH_INTERVAL_MS'), source.indexOf("byId('refresh').addEventListener"));
  vm.runInContext(functions, context);
  vm.runInContext('createLotCard = (lot) => lot;', context);
  return {
    run: (code) => vm.runInContext(code, context),
    name: () => element('detail-name').textContent,
    hidden: () => element('detail').hidden,
    text: (id) => element(id).textContent,
  };
}

const selectionLots = JSON.stringify([
  {id: 'a', name: 'Lot A', available: 1, occupied: 0, capacity: 1},
  {id: 'b', name: 'Lot B', available: 0, occupied: 1, capacity: 1},
]);

test('remembers a chosen lot on reopening and survives missing or empty data', () => {
  const values = new Map();
  const storage = {getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value)};
  let page = selectionPage(storage);
  page.run(`lots = ${selectionLots}; renderDashboard(); selectLot('b', true);`);
  page = selectionPage(storage);
  page.run(`lots = ${selectionLots}; renderDashboard();`);
  assert.equal(page.name(), 'Lot B');
  page.run('lots = lots.slice(0, 1); renderDashboard();');
  assert.equal(page.name(), 'Lot A');
  page.run('lots = []; renderDashboard();');
  assert.equal(page.hidden(), true);
  page.run(`lots = ${selectionLots}; renderDashboard();`);
  assert.equal(page.name(), 'Lot B');
});

test('blocked storage does not interrupt lot selection or refresh', () => {
  const page = selectionPage({getItem() {throw new Error('Blocked');}, setItem() {throw new Error('Blocked');}});
  page.run(`lots = ${selectionLots}; renderDashboard(); selectLot('b', true); renderDashboard();`);
  assert.equal(page.name(), 'Lot B');
});

test('last checked advances for unchanged data and failures without changing observation time', async () => {
  let clock = now;
  let fail = false;
  const data = snapshot();
  const page = selectionPage({getItem: () => null}, {
    Date: class extends Date { static now() { return clock; } },
    AbortSignal,
    fetch: async () => {
      if (fail) throw new Error('Unavailable');
      return {ok: true, json: async () => data};
    },
  });
  page.run('updateConnectionStatus();');
  assert.equal(page.text('last-checked'), 'Not yet');
  await page.run('loadParking();');
  const reported = page.text('updated');
  assert.equal(page.run('lastCheckedAt'), now);
  clock += 60000;
  await page.run('loadParking();');
  assert.equal(page.run('lastCheckedAt'), clock);
  assert.equal(page.text('updated'), reported);
  fail = true;
  clock += 60000;
  await page.run('loadParking();');
  assert.equal(page.run('lastCheckedAt'), clock);
  assert.equal(page.text('updated'), reported);
  assert.equal(page.text('data-status'), 'Refresh failed');
  assert.equal(page.text('total'), 1);
});
