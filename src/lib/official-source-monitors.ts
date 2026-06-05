import type { ReleaseArea, ReleaseChartPayload } from "@/lib/release-hub";

export type OfficialReportMonitor = {
  id: string;
  source: string;
  publisher: string;
  title: string;
  sourceUrl: string;
  releaseType: string;
  releaseDate: string;
  referencePeriod: string;
  affectedAreas: ReleaseArea[];
  headlineFacts: string[];
  chartPayloads: ReleaseChartPayload[];
  sourceLinks: Array<{ label: string; url: string }>;
  plainEnglishSummary: string;
  socialSummary: string;
  importanceScore: number;
  youthImpactScore: number;
  housingImpactScore: number;
};

type MonitorConfig = {
  id: string;
  source: string;
  publisher: string;
  pageUrl: string;
  fallbackTitle: string;
  releaseType: string;
  affectedAreas: ReleaseArea[];
  importanceScore: number;
  youthImpactScore: number;
  housingImpactScore: number;
  lens: string;
};

const monitors: MonitorConfig[] = [
  {
    id: "cer-nrcan-energy-watch",
    source: "cer-nrcan",
    publisher: "Canada Energy Regulator / NRCan",
    pageUrl: "https://www.cer-rec.gc.ca/en/data-analysis/",
    fallbackTitle: "Energy cost changed: CER and NRCan watch",
    releaseType: "energy-monitor",
    affectedAreas: ["energy", "trade"],
    importanceScore: 74,
    youthImpactScore: 58,
    housingImpactScore: 36,
    lens: "oil, gas, electricity, resource exports, emissions and energy cost pressure",
  },
  {
    id: "pbo-fiscal-reports",
    source: "pbo",
    publisher: "Parliamentary Budget Officer",
    pageUrl: "https://www.pbo-dpb.ca/en/",
    fallbackTitle: "Budget watchdog changed the fiscal story",
    releaseType: "fiscal-report-monitor",
    affectedAreas: ["fiscal", "housing"],
    importanceScore: 78,
    youthImpactScore: 68,
    housingImpactScore: 58,
    lens: "fiscal outlooks, program costing, infrastructure, affordability and debt sustainability",
  },
];

function decodeHtml(value: string) {
  return value
    .replace(/&#8212;|&mdash;/g, "-")
    .replace(/&#8211;|&ndash;/g, "-")
    .replace(/&#160;|&nbsp;/g, " ")
    .replace(/&#39;|&#x27;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/\s+/g, " ")
    .trim();
}

function stripTags(value: string) {
  return decodeHtml(value.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]*>/g, " "));
}

function absoluteUrl(url: string, base: string) {
  try {
    return new URL(url, base).toString();
  } catch {
    return base;
  }
}

function readMeta(html: string, name: string) {
  const patterns = [
    new RegExp(`<meta[^>]+name=["']${name}["'][^>]+content=["']([^"']+)["']`, "i"),
    new RegExp(`<meta[^>]+property=["']${name}["'][^>]+content=["']([^"']+)["']`, "i"),
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) return decodeHtml(match[1]);
  }

  return "";
}

function pageTitle(html: string) {
  const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1];
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1];
  return stripTags(h1 ?? title ?? "");
}

function findLikelyLatestLink(html: string, baseUrl: string) {
  const anchors = [...html.matchAll(/<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)]
    .map((match) => ({
      url: absoluteUrl(match[1], baseUrl),
      text: stripTags(match[2]),
    }))
    .filter((link) => link.text.length > 8 && !/subscribe|contact|terms|privacy|français/i.test(link.text));

  const scored = anchors
    .map((link) => {
      const text = link.text.toLowerCase();
      let score = 0;
      if (/report|monitor|analysis|publication|data|outlook|statement|snapshot|review/.test(text)) score += 4;
      if (/2026|2025/.test(text)) score += 3;
      if (/fiscal|budget|debt|energy|oil|gas|electricity|housing|cost/.test(text)) score += 3;
      if (link.url.includes("canada.ca") || link.url.includes("cer-rec.gc.ca") || link.url.includes("pbo-dpb.ca")) score += 1;
      return { ...link, score };
    })
    .sort((a, b) => b.score - a.score);

  return scored[0] ?? null;
}

function extractDate(html: string, fallback = new Date()) {
  const metaDate =
    readMeta(html, "dcterms.date") ||
    readMeta(html, "dc.date") ||
    readMeta(html, "date") ||
    readMeta(html, "article:published_time");
  const text = stripTags(html).slice(0, 6000);
  const dateLike =
    metaDate ||
    text.match(/\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},\s+20\d{2}\b/i)?.[0] ||
    text.match(/\b20\d{2}-\d{2}-\d{2}\b/)?.[0];
  const date = dateLike ? new Date(dateLike) : fallback;

  return Number.isNaN(date.getTime()) ? fallback.toISOString().slice(0, 10) : date.toISOString().slice(0, 10);
}

function extractNumberSignals(text: string, lens: string): ReleaseChartPayload["points"] {
  const sentences = text.split(/(?<=[.!?])\s+/).filter((sentence) => sentence.length > 35);
  const matches = sentences
    .flatMap((sentence) => {
      const local = [...sentence.matchAll(/(?:\$|C\$)?\s*([+-]?\d+(?:\.\d+)?)\s*(billion|million|%|per cent|percent|MW|GWh|barrels|bpd)?/gi)];
      return local.slice(0, 2).map((match) => ({ sentence, raw: match[0], value: Number(match[1]), unit: match[2] ?? "" }));
    })
    .filter((item) => Number.isFinite(item.value) && Math.abs(item.value) > 0)
    .slice(0, 6);

  if (!matches.length) {
    return [
      {
        label: "Official source monitor",
        value: 70,
        display: "Live",
        direction: "neutral",
        plainEnglish: `Canada Pulse fetched the official source and is monitoring it for ${lens}.`,
      },
    ];
  }

  return matches.map((item, index) => ({
    label: index === 0 ? "Main number" : `Signal ${index + 1}`,
    value: item.value,
    display: `${item.raw.replace(/\s+/g, " ").trim()}`,
    direction: /deficit|debt|charge|cost|expense|risk|increase|higher/i.test(item.sentence) ? "up" : "neutral",
    plainEnglish: item.sentence.slice(0, 240),
  }));
}

async function fetchHtml(url: string) {
  const response = await fetch(url, {
    headers: { "User-Agent": "Canada Pulse official release monitor" },
    next: { revalidate: 60 * 60 * 6 },
    signal: AbortSignal.timeout(3500),
  });

  if (!response.ok) throw new Error(`Official monitor fetch failed ${url}: ${response.status}`);
  return response.text();
}

export async function fetchOfficialReportMonitors(): Promise<OfficialReportMonitor[]> {
  const results = await Promise.allSettled(
    monitors.map(async (monitor) => {
      const indexHtml = await fetchHtml(monitor.pageUrl);
      const latestLink = findLikelyLatestLink(indexHtml, monitor.pageUrl);
      const detailUrl = latestLink?.url ?? monitor.pageUrl;
      const detailHtml = detailUrl === monitor.pageUrl ? indexHtml : await fetchHtml(detailUrl).catch(() => indexHtml);
      const title = pageTitle(detailHtml) || latestLink?.text || monitor.fallbackTitle;
      const description = readMeta(detailHtml, "description") || readMeta(detailHtml, "og:description");
      const text = [description, stripTags(detailHtml).slice(0, 3500)].filter(Boolean).join(" ");
      const points = extractNumberSignals(text, monitor.lens);
      const releaseDate = extractDate(detailHtml);

      return {
        ...monitor,
        title: `${monitor.publisher}: ${title}`.slice(0, 140),
        sourceUrl: detailUrl,
        releaseDate,
        referencePeriod: releaseDate,
        headlineFacts: [
          description || `Canada Pulse fetched the official ${monitor.publisher} source.`,
          ...points.slice(0, 3).map((point) => `${point.label}: ${point.display}`),
        ],
        chartPayloads: [
          {
            title: `${monitor.publisher} signal map`,
            kind: "bar" as const,
            points,
          },
        ],
        sourceLinks: [
          { label: "Latest monitored item", url: detailUrl },
          { label: `${monitor.publisher} source page`, url: monitor.pageUrl },
        ],
        plainEnglishSummary:
          `${monitor.publisher} is now live in the release hub. Canada Pulse watches this source for ${monitor.lens}, then turns new official pages into chartable signals and plain-English pressure reads.`,
        socialSummary: `${monitor.publisher} watch: ${title}`.slice(0, 220),
      };
    }),
  );

  return results.flatMap((result) => (result.status === "fulfilled" ? [result.value] : []));
}

export type IrccOpenDataSignal = {
  topic: string;
  packageTitle: string;
  packageUrl: string;
  datasetCount: number;
  resourceCount: number;
  datastoreRecords: number | null;
  lastModified: string;
};

function localizeTitle(value: string | Record<string, string> | undefined) {
  if (!value) return "Untitled dataset";
  if (typeof value === "string") return value;
  return value.en ?? value.fr ?? Object.values(value)[0] ?? "Untitled dataset";
}

export async function fetchIrccOpenDataSignals(): Promise<IrccOpenDataSignal[]> {
  const topics = [
    { topic: "Permanent residents", query: "IRCC permanent residents province" },
    { topic: "Temporary foreign workers", query: "IRCC temporary foreign workers" },
    { topic: "International students", query: "IRCC international students permits" },
    { topic: "Refugees and asylum", query: "IRCC refugees asylum claims" },
  ];

  const results = await Promise.allSettled(
    topics.map(async ({ topic, query }) => {
      const searchUrl = `https://open.canada.ca/data/api/3/action/package_search?q=${encodeURIComponent(query)}&rows=1`;
      const response = await fetch(searchUrl, {
        next: { revalidate: 60 * 60 * 12 },
        signal: AbortSignal.timeout(3500),
      });
      if (!response.ok) throw new Error(`Open Government search failed ${topic}: ${response.status}`);
      const json = (await response.json()) as {
        result?: {
          count?: number;
          results?: Array<{
            name?: string;
            title?: string | Record<string, string>;
            metadata_modified?: string;
            resources?: Array<{ id?: string; datastore_active?: boolean }>;
          }>;
        };
      };
      const dataset = json.result?.results?.[0];
      const activeResource = dataset?.resources?.find((resource) => resource.datastore_active && resource.id);
      let datastoreRecords: number | null = null;

      if (activeResource?.id) {
        const datastoreUrl = `https://open.canada.ca/data/api/3/action/datastore_search?resource_id=${activeResource.id}&limit=1`;
        const datastoreResponse = await fetch(datastoreUrl, {
          next: { revalidate: 60 * 60 * 12 },
          signal: AbortSignal.timeout(2500),
        }).catch(() => null);
        if (datastoreResponse?.ok) {
          const datastoreJson = (await datastoreResponse.json()) as { result?: { total?: number } };
          datastoreRecords = datastoreJson.result?.total ?? null;
        }
      }

      return {
        topic,
        packageTitle: localizeTitle(dataset?.title),
        packageUrl: dataset?.name ? `https://open.canada.ca/data/en/dataset/${dataset.name}` : searchUrl,
        datasetCount: json.result?.count ?? 0,
        resourceCount: dataset?.resources?.length ?? 0,
        datastoreRecords,
        lastModified: dataset?.metadata_modified?.slice(0, 10) ?? new Date().toISOString().slice(0, 10),
      };
    }),
  );

  return results.flatMap((result) => (result.status === "fulfilled" ? [result.value] : []));
}
