export type PublicDataStatus = "live" | "stale" | "fallback" | "import_pending" | "error";

export type PublicIndicatorValue = {
  indicatorSlug: string;
  indicatorName: string;
  categorySlug: string;
  geographySlug: string;
  geographyName: string;
  latest: {
    value: number;
    period: string;
    label?: string | null;
    unit: string;
  } | null;
  trend: Array<{ value: number; period: string; label?: string | null }>;
  source: {
    name: string;
    publisher: string;
    url: string;
  };
  status: PublicDataStatus;
  lastFetchedAt?: string | null;
  note?: string | null;
};

export function prismaStatusToPublic(status?: string | null): PublicDataStatus {
  switch (status) {
    case "LIVE":
      return "live";
    case "STALE":
      return "stale";
    case "IMPORT_PENDING":
      return "import_pending";
    case "ERROR":
      return "error";
    default:
      return "fallback";
  }
}

export function sourceStatusToPublic(status?: string | null): PublicDataStatus {
  switch (status) {
    case "LIVE":
      return "live";
    case "IMPORT_PENDING":
    case "SOURCE_LINKED":
    case "LICENSED_SOURCE_NEEDED":
    case "NEEDS_SOURCE":
      return "import_pending";
    default:
      return "fallback";
  }
}
