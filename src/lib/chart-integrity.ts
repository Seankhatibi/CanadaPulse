type EvidencePoint = { display: string; value: number; period?: string; unit?: string; comparisonKey?: string };
export function comparableScale(points: EvidencePoint[]): boolean {
  if (points.length < 2 || points.some((point) => !Number.isFinite(point.value))) return false;
  // Unknown units and populations must not be placed on an invented common scale.
  const first = points[0];
  return Boolean(first.unit && first.comparisonKey && first.period)
    && points.every((point) => point.unit === first.unit && point.comparisonKey === first.comparisonKey && point.period === first.period);
}
export function barWidth(value: number, maximum: number) {
  return Number.isFinite(value) && Number.isFinite(maximum) && maximum > 0 ? Math.min(100, Math.abs(value) / maximum * 100) : 0;
}
