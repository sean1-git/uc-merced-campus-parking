import test from 'node:test';
import assert from 'node:assert/strict';
import {readSnapshot} from './public/parking-data.mjs';

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
