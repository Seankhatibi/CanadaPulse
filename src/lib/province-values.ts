export function parseComparableProvinceValue(value: string) {
  const normalized = value.replaceAll(",", "").replace("−", "-");
  const match = normalized.match(/[+-]?\d+(?:\.\d+)?/);
  if (!match) return null;

  const number = Number(match[0]);
  if (!Number.isFinite(number)) return null;
  const suffix = normalized.slice((match.index ?? 0) + match[0].length).trimStart().match(/^([kmbt])\b/i)?.[1].toLowerCase();
  const multiplier = suffix === "t" ? 1e12 : suffix === "b" ? 1e9 : suffix === "m" ? 1e6 : suffix === "k" ? 1e3 : 1;
  return number * multiplier;
}

export function rankComparableProvinceValues<T extends { province: string; value: string }>(rows: T[]) {
  const sorted = rows
    .map((row) => ({ ...row, comparableValue: parseComparableProvinceValue(row.value) }))
    .filter((row): row is T & { comparableValue: number } => row.comparableValue !== null)
    .sort((left, right) => right.comparableValue - left.comparableValue);

  return sorted.map((row) => ({
    ...row,
    comparableRank: 1 + sorted.filter((candidate) => candidate.comparableValue > row.comparableValue).length,
  }));
}
