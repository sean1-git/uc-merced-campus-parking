const STALE_AFTER_MS = 60000;
const ALLOWED_CLOCK_SKEW_MS = 5000;

// Reject the whole snapshot if any lot is invalid, so totals never hide missing data.
export function readSnapshot(data, now = Date.now()) {
  if (!data || !Array.isArray(data.lots)) {
    throw new Error('Expected a parking snapshot');
  }
  const updatedAt = Date.parse(data.updated_at);
  if (!Number.isFinite(updatedAt) || updatedAt > now + ALLOWED_CLOCK_SKEW_MS) {
    throw new Error('Invalid update time');
  }
  const lotIds = new Set();
  const lots = [];
  for (const lot of data.lots) {
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
      if (space.status === 'available') {
        counts.available += 1;
      } else {
        counts.occupied += 1;
      }
    }
    lots.push({
      id: lot.id,
      name: lot.name,
      capacity: lot.spaces.length,
      available: counts.available,
      occupied: counts.occupied,
    });
  }
  return {updatedAt, lots};
}

// Show refresh failures first so students know why the counts cannot be trusted.
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
  if (now - updatedAt > STALE_AFTER_MS) {
    return {
      state: 'outdated',
      label: 'Outdated counts',
      message: 'The file loaded, but its parking data is more than a minute old. Check the reported time before relying on these counts.',
    };
  }
  return {state: 'current', label: 'Data up to date', message: ''};
}
