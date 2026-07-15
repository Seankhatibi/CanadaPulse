export function formatReleaseDate(value: string) {
  const dateOnly = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const timestamp = dateOnly
    ? Date.UTC(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3]), 12)
    : Date.parse(value);

  return Number.isFinite(timestamp)
    ? new Intl.DateTimeFormat("en-CA", {
        dateStyle: "long",
        timeZone: "America/Toronto",
      }).format(new Date(timestamp))
    : value;
}

export function formatReferencePeriod(value: string) {
  if (/^\d{4}-\d{2}-\d{2}T/.test(value)) return formatReleaseDate(value.slice(0, 10));
  const normalized = value
    .replace(/^Latest official (?:table )?period:\s*/i, "")
    .replace(/^Latest official quarter:\s*/i, "");
  if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) return formatReleaseDate(normalized);
  return normalized;
}
