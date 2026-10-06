// Each JSON file contains a complete snapshot, not individual changes.
export function readSnapshot(data, now = Date.now()) {
  if (!data || !Array.isArray(data.lots)) {
    throw new Error('Expected a parking snapshot');
  }
  const updatedAt = Date.parse(data.updated_at);
  if (!Number.isFinite(updatedAt) || updatedAt > now + 5000) {
    throw new Error('Invalid update time');
  }
  const lotIds = new Set();
  const lots = data.lots.map((lot) => {
    if (!lot || typeof lot.id !== 'string' || !lot.id.trim() || lotIds.has(lot.id) ||
        typeof lot.name !== 'string' || !lot.name.trim() || !Array.isArray(lot.spaces)) {
      throw new Error('Invalid or duplicate lot');
    }
    lotIds.add(lot.id);
    const counts = {available: 0, occupied: 0};
    const spaceIds = new Set();
    for (const space of lot.spaces) {
      if (!space || typeof space.id !== 'string' || !space.id.trim() || spaceIds.has(space.id) ||
          !['available', 'occupied'].includes(space.status)) {
        throw new Error('Invalid or duplicate space');
      }
      spaceIds.add(space.id);
      counts[space.status] += 1;
    }
    return {id: lot.id, name: lot.name, capacity: lot.spaces.length, ...counts};
  });
  return {updatedAt, lots};
}
