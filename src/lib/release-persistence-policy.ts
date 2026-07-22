export type ReleasePersistenceCandidate = {
  status?: unknown;
  metricCount?: unknown;
};

const statusQuality: Record<string, number> = {
  error: 0,
  source_linked: 1,
  summary_only: 2,
  stale: 3,
  live: 4,
};

function quality(value: unknown) {
  return typeof value === "string" ? statusQuality[value] ?? 0 : 0;
}

function metricCount(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? Math.max(0, value) : 0;
}

export function shouldReplacePersistedRelease(
  existing: ReleasePersistenceCandidate,
  incoming: ReleasePersistenceCandidate,
) {
  const existingQuality = quality(existing.status);
  const incomingQuality = quality(incoming.status);

  if (incomingQuality < existingQuality) return false;
  if (
    incomingQuality === existingQuality &&
    metricCount(existing.metricCount) > metricCount(incoming.metricCount)
  ) {
    return false;
  }

  return true;
}
