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

// A failed request takes priority over age: the counts may also be outdated.
export function getDataStatus({updatedAt, failed, online, now = Date.now()}) {
  if (updatedAt === null) {
    return {
      state: 'waiting',
      label: 'Waiting for first data',
      message: online
        ? 'No valid parking data has loaded yet. Counts will appear when the first file is available.'
        : 'You are offline. Waiting for the first parking data file.',
    };
  }
  if (failed || !online) {
    return {
      state: 'failed',
      label: 'Refresh failed',
      message: online
        ? 'Could not refresh. Showing last reported counts, which may be outdated. Retrying every minute.'
        : 'You are offline. Showing last reported counts, which may be outdated. Updates resume when you reconnect.',
    };
  }
  if (now - updatedAt > 60000) {
    return {
      state: 'outdated',
      label: 'Outdated counts',
      message: 'The file loaded, but its parking data is more than a minute old. Check the reported time before relying on these counts.',
    };
  }
  return {state: 'current', label: 'Data up to date', message: ''};
}
