type IrccRow = Record<string, string>;

type DatasetConfig = {
  key: "permanentResidents" | "studyPermits" | "tfwp" | "imp" | "asylum";
  label: string;
  packageId: string;
  resourceUrl: string;
};

export type IrccMetric = {
  key: DatasetConfig["key"];
  label: string;
  period: string;
  value: number;
  previous: number | null;
  change: number | null;
  provinceValues: Array<{ province: string; value: number; change: number | null }>;
};

export type IrccImmigrationSnapshot = {
  releaseDate: string;
  referencePeriod: string;
  metrics: IrccMetric[];
  permanentResidentCategories: Array<{ label: string; value: number; previous: number | null; change: number | null }>;
  sourceLinks: Array<{ label: string; url: string }>;
  rounded: true;
};

const monthNumber: Record<string, number> = {
  Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6,
  Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12,
};

const datasets: DatasetConfig[] = [
  {
    key: "permanentResidents",
    label: "Permanent residents admitted",
    packageId: "f7e5498e-0ad8-4417-85c9-9b8aff9b9eda",
    resourceUrl: "https://www.ircc.canada.ca/opendata-donneesouvertes/data/ODP-PR-PT_IMMCAT.csv",
  },
  {
    key: "studyPermits",
    label: "Study permit holders with permit(s) becoming effective",
    packageId: "90115b00-f9b8-49e8-afa3-b4cff8facaee",
    resourceUrl: "https://www.ircc.canada.ca/opendata-donneesouvertes/data/ODP-TR-Study-IS_PT_study.csv",
  },
  {
    key: "tfwp",
    label: "TFWP work permit holders with permit(s) becoming effective",
    packageId: "360024f2-17e9-4558-bfc1-3616485d65b9",
    resourceUrl: "https://www.ircc.canada.ca/opendata-donneesouvertes/data/ODP-TR-Work-TFWP-PT_program.csv",
  },
  {
    key: "imp",
    label: "IMP work permit holders with permit(s) becoming effective",
    packageId: "360024f2-17e9-4558-bfc1-3616485d65b9",
    resourceUrl: "https://www.ircc.canada.ca/opendata-donneesouvertes/data/ODP-TR-Work-IMP-PT_program.csv",
  },
  {
    key: "asylum",
    label: "Asylum claimants",
    packageId: "b6cbcf4d-f763-4924-a2fb-8cc4a06e3de4",
    resourceUrl: "https://www.ircc.canada.ca/opendata-donneesouvertes/data/ODP-Asylum-PT_OfficeType.csv",
  },
];

async function fetchOfficial(url: string, timeoutMs: number) {
  let lastError: unknown;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: { "User-Agent": "Canada Pulse IRCC importer" },
        next: { revalidate: 12 * 60 * 60 },
        signal: AbortSignal.timeout(timeoutMs),
      });
      if (response.ok || response.status < 500 && response.status !== 429) return response;
      lastError = new Error(`Official IRCC resource returned ${response.status}.`);
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, 250 * 2 ** attempt));
  }
  throw lastError instanceof Error ? lastError : new Error("Official IRCC resource fetch failed.");
}

function period(row: IrccRow) {
  const month = monthNumber[row.EN_MONTH];
  return month ? `${row.EN_YEAR}-${String(month).padStart(2, "0")}` : "";
}

function value(row: IrccRow) {
  const parsed = Number(row.TOTAL);
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseTsv(text: string) {
  const [headerLine = "", ...lines] = text.replace(/^\uFEFF/, "").trim().split(/\r?\n/);
  const header = headerLine.split("\t");
  return lines.map((line) => {
    const cells = line.split("\t");
    return Object.fromEntries(header.map((name, index) => [name, cells[index] ?? ""]));
  });
}

function aggregate(rows: IrccRow[], selectedPeriod: string, field: string) {
  const totals = new Map<string, number>();
  for (const row of rows) {
    if (period(row) !== selectedPeriod) continue;
    const label = row[field];
    if (!label || /not stated/i.test(label)) continue;
    totals.set(label, (totals.get(label) ?? 0) + value(row));
  }
  return totals;
}

function totalForPeriod(rows: IrccRow[], selectedPeriod: string) {
  return rows.filter((row) => period(row) === selectedPeriod).reduce((sum, row) => sum + value(row), 0);
}

function previousPeriod(periods: string[], latest: string) {
  return periods.filter((item) => item < latest).sort().at(-1) ?? null;
}

async function fetchDataset(config: DatasetConfig) {
  const [resourceResponse, packageResponse] = await Promise.all([
    fetchOfficial(config.resourceUrl, 10_000),
    fetchOfficial(`https://open.canada.ca/data/api/3/action/package_show?id=${config.packageId}`, 6_000),
  ]);
  if (!resourceResponse.ok) throw new Error(`IRCC ${config.key} resource failed: ${resourceResponse.status}`);
  const rows = parseTsv(await resourceResponse.text());
  const periods = [...new Set(rows.map(period).filter(Boolean))].sort();
  const latest = periods.at(-1);
  if (!latest) throw new Error(`IRCC ${config.key} has no reference period.`);
  const previous = previousPeriod(periods, latest);
  const provinceCurrent = aggregate(rows, latest, "EN_PROVINCE_TERRITORY");
  const provincePrevious = previous ? aggregate(rows, previous, "EN_PROVINCE_TERRITORY") : new Map<string, number>();
  const packageJson = packageResponse.ok ? await packageResponse.json() as { result?: { metadata_modified?: string } } : null;
  const currentValue = totalForPeriod(rows, latest);
  const previousValue = previous ? totalForPeriod(rows, previous) : null;

  return {
    config,
    rows,
    latest,
    previous,
    releaseDate: packageJson?.result?.metadata_modified?.slice(0, 10) ?? latest,
    metric: {
      key: config.key,
      label: config.label,
      period: latest,
      value: currentValue,
      previous: previousValue,
      change: previousValue === null ? null : currentValue - previousValue,
      provinceValues: [...provinceCurrent.entries()]
        .map(([province, current]) => ({
          province,
          value: current,
          change: provincePrevious.has(province) ? current - (provincePrevious.get(province) ?? 0) : null,
        }))
        .sort((a, b) => b.value - a.value),
    } satisfies IrccMetric,
  };
}

export async function fetchIrccImmigrationSnapshot(): Promise<IrccImmigrationSnapshot> {
  const results = await Promise.all(datasets.map(fetchDataset));
  const permanentResidents = results.find((result) => result.config.key === "permanentResidents");
  if (!permanentResidents) throw new Error("IRCC permanent-resident dataset was not loaded.");
  const currentCategories = aggregate(permanentResidents.rows, permanentResidents.latest, "EN_IMMIGRATION_CATEGORY-MAIN_CATEGORY");
  const previousCategories = permanentResidents.previous
    ? aggregate(permanentResidents.rows, permanentResidents.previous, "EN_IMMIGRATION_CATEGORY-MAIN_CATEGORY")
    : new Map<string, number>();
  const categoryLabels: Record<string, string> = {
    Economic: "Economic immigration",
    "Sponsored Family": "Sponsored family",
    "Resettled Refugee & Protected Person in Canada": "Refugee and protected-person admissions",
    "All Other Immigration": "Other permanent-resident admissions",
  };

  return {
    releaseDate: results.map((result) => result.releaseDate).sort().at(-1) ?? permanentResidents.latest,
    referencePeriod: results.map((result) => result.latest).sort().at(-1) ?? permanentResidents.latest,
    metrics: results.map((result) => result.metric),
    permanentResidentCategories: [...currentCategories.entries()]
      .map(([label, current]) => ({
        label: categoryLabels[label] ?? label,
        value: current,
        previous: previousCategories.get(label) ?? null,
        change: previousCategories.has(label) ? current - (previousCategories.get(label) ?? 0) : null,
      }))
      .sort((a, b) => b.value - a.value),
    sourceLinks: [
      { label: "Permanent residents", url: "https://open.canada.ca/data/en/dataset/f7e5498e-0ad8-4417-85c9-9b8aff9b9eda" },
      { label: "Study permit holders", url: "https://open.canada.ca/data/en/dataset/90115b00-f9b8-49e8-afa3-b4cff8facaee" },
      { label: "TFWP and IMP work permit holders", url: "https://open.canada.ca/data/en/dataset/360024f2-17e9-4558-bfc1-3616485d65b9" },
      { label: "Asylum claimants", url: "https://open.canada.ca/data/en/dataset/b6cbcf4d-f763-4924-a2fb-8cc4a06e3de4" },
    ],
    rounded: true,
  };
}
