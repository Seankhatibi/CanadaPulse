export type StatCanDailyEntry = {
  title: string;
  href: string;
  published: string;
  summary: string;
  feed: string;
};

export type ReleaseSignal = {
  label: string;
  value: number;
  display: string;
  direction: "up" | "down" | "neutral";
  explanation: string;
  previous?: number | null;
  previousDisplay?: string;
  change?: number | null;
  changeDisplay?: string;
  period?: string;
  changePeriod?: string;
};

export type ReleaseExplainer = {
  title: string;
  subtitle: string;
  plainEnglish: string;
  whyItMatters: string[];
  whatToWatch: string[];
  signals: ReleaseSignal[];
  tableIds?: string[];
  sourceStatus?: "table_data_loaded" | "table_links_detected" | "summary_only";
  officialUrl: string;
  published: string;
  feed: string;
};

const dailyFeeds = [
  {
    label: "All StatCan Daily releases",
    url: "https://www150.statcan.gc.ca/n1/rss/dai-quo/0-eng.atom",
  },
  {
    label: "Economic accounts",
    url: "https://www150.statcan.gc.ca/n1/rss/dai-quo/36-eng.atom",
  },
  {
    label: "Prices and price indexes",
    url: "https://www150.statcan.gc.ca/n1/rss/dai-quo/62-eng.atom",
  },
  {
    label: "Labour",
    url: "https://www150.statcan.gc.ca/n1/rss/dai-quo/14-eng.atom",
  },
] as const;

function stripTags(value: string) {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .replace(/&#160;/g, " ")
    .replace(/&#8212;/g, "-")
    .replace(/&#x27;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, "\"")
    .trim();
}

function readTag(entry: string, tag: string) {
  const match = entry.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return match ? stripTags(match[1]) : "";
}

function readHref(entry: string) {
  const match = entry.match(/<link[^>]+href="([^"]+)"/i);
  return match?.[1] ?? "";
}

function parseAtomFeed(xml: string, feed: string): StatCanDailyEntry[] {
  const entries = xml.match(/<entry[\s\S]*?<\/entry>/gi) ?? [];

  return entries.slice(0, 30).map((entry) => ({
    title: readTag(entry, "title"),
    href: normalizeStatCanDailyUrl(readHref(entry)),
    published: readTag(entry, "published") || readTag(entry, "updated"),
    summary: readTag(entry, "summary"),
    feed,
  }));
}

export async function fetchStatCanDailyEntries(): Promise<StatCanDailyEntry[]> {
  const responses = await Promise.allSettled(
    dailyFeeds.map(async (feed) => {
      const response = await fetch(feed.url, {
        headers: { "User-Agent": "Canada Pulse release monitor" },
        cache: "no-store",
        signal: AbortSignal.timeout(6000),
      });

      if (!response.ok) {
        throw new Error(`${feed.label} feed returned ${response.status}`);
      }

      return parseAtomFeed(await response.text(), feed.label);
    }),
  );

  const entries = responses.flatMap((response) => (response.status === "fulfilled" ? response.value : []));
  const directEntries = await fetchDirectDailyEntriesForRecentDays().catch(() => []);

  return [...new Map([...directEntries, ...entries].map((entry) => [entry.href, entry])).values()];
}

function readMetaContent(html: string, name: string) {
  const match = html.match(new RegExp(`<meta[^>]+name=["']${name}["'][^>]+content=["']([^"']+)["']`, "i"));
  return match ? stripTags(match[1]) : "";
}

function readHeading(html: string) {
  const match = html.match(/<h1[^>]*id=["']wb-cont["'][^>]*>([\s\S]*?)<\/h1>/i);
  return match ? stripTags(match[1]) : "";
}

function readDateModified(html: string) {
  const match = html.match(/<time[^>]+property=["']dateModified["'][^>]*>\s*([\s\S]*?)\s*<\/time>/i);
  return match ? stripTags(match[1]) : "";
}

function normalizeStatCanDailyUrl(url: string) {
  return url
    .replace("https://www.statcan.gc.ca", "https://www150.statcan.gc.ca")
    .replace("https://www150.statcan.gc.ca/daily-quotidien/", "https://www150.statcan.gc.ca/n1/daily-quotidien/");
}

export async function fetchStatCanDailyEntryFromUrl(url: string): Promise<StatCanDailyEntry | null> {
  const href = normalizeStatCanDailyUrl(url);
  if (!/^https:\/\/www150\.statcan\.gc\.ca\/n1\/daily-quotidien\//.test(href)) {
    return null;
  }

  const response = await fetch(href, {
    headers: { "User-Agent": "Canada Pulse release monitor" },
    cache: "no-store",
    signal: AbortSignal.timeout(6000),
  });

  if (!response.ok) return null;

  const html = await response.text();
  const title = readHeading(html) || readMetaContent(html, "dcterms.title") || readMetaContent(html, "title");
  const summary = readMetaContent(html, "dcterms.description") || readMetaContent(html, "description");
  const published = readDateModified(html) || new Date().toISOString();

  if (!title) return null;

  return {
    title,
    href,
    published,
    summary,
    feed: "Statistics Canada Daily",
  };
}

function statCanDailyDateCode(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Toronto",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const year = parts.find((part) => part.type === "year")?.value ?? "";
  const month = parts.find((part) => part.type === "month")?.value ?? "";
  const day = parts.find((part) => part.type === "day")?.value ?? "";

  return `${year.slice(2)}${month}${day}`;
}

function daysAgo(count: number) {
  const date = new Date();
  date.setDate(date.getDate() - count);
  return date;
}

async function fetchDirectDailyEntriesForRecentDays() {
  const codes = [0, 1, 2, 3].map((offset) => statCanDailyDateCode(daysAgo(offset)));
  const suffixes = ["a", "b", "c", "d", "e", "f", "g", "h"];
  const probes = await Promise.allSettled(
    codes.flatMap((code) =>
      suffixes.map((suffix) =>
        fetchStatCanDailyEntryFromUrl(
          `https://www150.statcan.gc.ca/n1/daily-quotidien/${code}/dq${code}${suffix}-eng.htm`,
        ),
      ),
    ),
  );

  return probes.flatMap((probe) => (probe.status === "fulfilled" && probe.value ? [probe.value] : []));
}

export function getLatestDailyReleaseDate(entries: StatCanDailyEntry[]) {
  return entries
    .map((entry) => entry.published.slice(0, 10))
    .filter(Boolean)
    .sort()
    .at(-1) ?? "";
}

export function getEntriesForReleaseDate(entries: StatCanDailyEntry[], releaseDate: string) {
  return entries.filter((entry) => entry.published.startsWith(releaseDate));
}

export function getReleaseExplainerHref(entry: Pick<StatCanDailyEntry, "href">) {
  return `/release?url=${encodeURIComponent(entry.href)}`;
}

export function findDailyEntryByHref(entries: StatCanDailyEntry[], href: string) {
  return entries.find((entry) => entry.href === href);
}

export function rankDailyEntries(entries: StatCanDailyEntry[]) {
  const hotTerms = [
    "gross domestic product",
    "gdp",
    "consumer price index",
    "inflation",
    "labour force",
    "employment",
    "unemployment",
    "productivity",
    "unit labour cost",
    "hourly compensation",
    "business output",
    "wages",
    "housing",
    "trade",
    "retail trade",
    "retail sales",
    "retail",
    "wholesale trade",
    "consumer spending",
    "consumer demand",
    "sales",
    "manufacturing sales",
  ];

  return [...entries]
    .map((entry) => {
      const haystack = `${entry.title} ${entry.summary}`.toLowerCase();
      const score = hotTerms.reduce((total, term) => total + (haystack.includes(term) ? 1 : 0), 0);
      return { ...entry, score };
    })
    .sort((a, b) => b.score - a.score || b.published.localeCompare(a.published));
}

function getReleaseTheme(entry: StatCanDailyEntry) {
  const text = `${entry.title} ${entry.summary}`.toLowerCase();

  if (text.includes("productivity") || text.includes("unit labour cost")) {
    return {
      subtitle: "Productivity is the quiet number behind wages, competitiveness, and living standards.",
      whyItMatters: [
        "When productivity falls, Canada is producing less output per hour worked.",
        "Weak productivity makes it harder for wages to rise without adding inflation pressure.",
        "For young Canadians, this matters because long-term income growth depends on productivity growth.",
      ],
      whatToWatch: [
        "Did business output fall, or did hours worked rise faster than output?",
        "Are unit labour costs rising faster than productivity?",
        "Does this become a one-quarter wobble or a multi-quarter trend?",
      ],
    };
  }

  if (text.includes("gross domestic product") || text.includes("gdp")) {
    return {
      subtitle: "GDP shows whether Canada is actually producing more goods and services.",
      whyItMatters: [
        "Flat or shrinking GDP means less economic momentum.",
        "GDP per person matters because national growth can hide weaker living standards.",
        "The sector breakdown shows whether growth is broad or carried by a few pockets.",
      ],
      whatToWatch: [
        "Which sectors grew and which shrank?",
        "Was growth driven by households, businesses, exports, or government?",
        "Did GDP per person improve or weaken?",
      ],
    };
  }

  if (text.includes("consumer price index") || text.includes("inflation")) {
    return {
      subtitle: "Inflation shows how quickly everyday prices are moving.",
      whyItMatters: [
        "Inflation directly changes how far a paycheque goes.",
        "Food, rent, mortgage interest, gas, and services matter more emotionally than the headline alone.",
        "The component breakdown shows what is actually driving household pressure.",
      ],
      whatToWatch: [
        "Are food and shelter moving differently than headline inflation?",
        "Are price pressures broad, or concentrated in a few categories?",
        "Does the release change the interest-rate conversation?",
      ],
    };
  }

  if (text.includes("labour force") || text.includes("employment") || text.includes("unemployment")) {
    return {
      subtitle: "Labour releases show whether Canadians are finding work and whether wages are keeping up.",
      whyItMatters: [
        "Jobs are the bridge between the economy and daily life.",
        "Youth unemployment, wage growth, and hours worked can tell different stories than the headline.",
        "A weak labour market makes affordability pressure feel worse.",
      ],
      whatToWatch: [
        "Did full-time work grow or shrink?",
        "What happened to youth unemployment?",
        "Are wages rising faster than prices?",
      ],
    };
  }

  if (text.includes("retail trade") || text.includes("retail sales") || text.includes("retail")) {
    return {
      subtitle: "Retail sales show whether households are still spending or pulling back.",
      whyItMatters: [
        "Retail sales are a direct read on consumer demand, affordability pressure, and economic momentum.",
        "Strong sales can signal resilient households, but can also complicate the inflation and rates story.",
        "The province and subsector breakdown shows whether spending strength is broad or concentrated.",
      ],
      whatToWatch: [
        "Did core retail sales move differently from headline retail sales?",
        "Which provinces and store categories drove the change?",
        "Does the advance estimate point to stronger or weaker next-month demand?",
      ],
    };
  }

  return {
    subtitle: "This official release is being monitored because it can affect affordability, jobs, wages, or public pressure.",
    whyItMatters: [
      "Official releases can change the national story quickly.",
      "The headline is only the start; the important part is what changed underneath.",
      "Canada Pulse turns the source release into a plain-English read and visual signal map.",
    ],
    whatToWatch: [
      "Which metric changed most?",
      "Does the change affect households, businesses, government, or provinces?",
      "Is this a one-time move or part of a trend?",
    ],
  };
}

function signalLabel(sentence: string, index: number) {
  const lower = sentence.toLowerCase();

  if (/unemployment rate/.test(lower)) return "Unemployment rate";
  if (/employment rate/.test(lower)) return "Employment rate";
  if (/employment/.test(lower)) return "Employment";
  if (/retail sales/.test(lower)) return index === 0 ? "Retail sales" : "Retail sales change";
  if (/inflation|consumer price/.test(lower)) return "Inflation";
  if (/gross domestic product|gdp/.test(lower)) return "GDP";
  if (/productivity/.test(lower)) return "Productivity";
  if (/wage|earnings|compensation/.test(lower)) return "Wages";
  return index === 0 ? "Headline change" : `Signal ${index + 1}`;
}

function extractSummarySignals(entry: StatCanDailyEntry): ReleaseSignal[] {
  const text = `${entry.title}. ${entry.summary}`;
  const matches = [...text.matchAll(/([+-]?\d+(?:\.\d+)?)%/g)].slice(0, 6);
  const percentSignals: ReleaseSignal[] = matches.map((match, index) => {
    const value = Number(match[1]);
    const sentence =
      text
        .split(/(?<=[.!?])\s+/)
        .find((part) => part.includes(match[0]))
        ?.trim() || entry.summary;
    const matchIndex = Math.max(0, sentence.indexOf(match[0]));
    const before = sentence.slice(0, matchIndex);
    const context = `${before.slice(-90)} ${sentence.slice(matchIndex, matchIndex + match[0].length + 24)}`;
    const pointMove = before.match(/(rose|increased|grew|climbed|declined|fell|decreased|dropped)\s+(?:by\s+)?(\d+(?:\.\d+)?)\s+percentage points?\s+to\s*$/i);
    const nearbyMove = before.match(/(rose|increased|grew|climbed|was up|declined|fell|decreased|dropped|was down)\s+(?:by\s+)?$/i);
    const signed = /^[+-]/.test(match[1]);
    const moveWord = (pointMove?.[1] ?? nearbyMove?.[1] ?? "").toLowerCase();
    const moveDirection = /declined|fell|decreased|dropped|down/.test(moveWord) ? -1 : moveWord ? 1 : 0;
    const directionValue = pointMove ? moveDirection : signed ? Math.sign(value) : moveDirection;
    const change = pointMove
      ? Number(pointMove[2]) * moveDirection
      : signed || moveDirection ? Math.abs(value) * (directionValue || 1) : null;
    const isLevel = Boolean(pointMove) || /(?:to|at|was|stood at|reached)\s*$/i.test(before);
    const labelContext = signed && !isLevel ? before.slice(-90) : context;
    const display = `${!isLevel && signed && value > 0 ? "+" : ""}${value}%`;
    const changeDisplay = pointMove
      ? `${change && change > 0 ? "+" : ""}${change?.toFixed(1)} pts`
      : change === null ? undefined : `${change > 0 ? "+" : ""}${change}%`;

    return {
      label: signalLabel(labelContext, index),
      value,
      display,
      direction: directionValue > 0 ? "up" : directionValue < 0 ? "down" : "neutral",
      explanation: sentence,
      change,
      changeDisplay,
      period: entry.published.slice(0, 10),
    };
  });

  const currencyMatch = text.match(/\$([0-9]+(?:\.[0-9]+)?)\s*(billion|million)/i);
  const currencySignal: ReleaseSignal[] = currencyMatch
    ? [{
        label: /retail/i.test(text) ? "Retail sales" : "Headline value",
        value: Number(currencyMatch[1]),
        display: `$${currencyMatch[1]}${currencyMatch[2].toLowerCase() === "billion" ? "B" : "M"}`,
        direction: "neutral",
        explanation: text.split(/(?<=[.!?])\s+/).find((part) => part.includes(currencyMatch[0]))?.trim() || entry.summary,
        period: entry.published.slice(0, 10),
      }]
    : [];

  return [...currencySignal, ...percentSignals].filter(
    (signal, index, signals) => signals.findIndex((candidate) => candidate.label === signal.label && candidate.display === signal.display) === index,
  );
}

export function buildReleaseExplainer(entry: StatCanDailyEntry): ReleaseExplainer {
  const theme = getReleaseTheme(entry);
  const signals = extractSummarySignals(entry);

  return {
    title: entry.title,
    subtitle: theme.subtitle,
    plainEnglish: entry.summary || "Canada Pulse detected this official release and is preparing a fuller breakdown.",
    whyItMatters: theme.whyItMatters,
    whatToWatch: theme.whatToWatch,
    signals:
      signals.length > 0
        ? signals
        : [
            {
              label: "Release detected",
              value: 1,
              display: "New",
              direction: "neutral",
              explanation: "This release has been detected from the official feed. A fuller metric breakdown needs the source table values.",
            },
          ],
    officialUrl: entry.href,
    published: entry.published,
    feed: entry.feed,
    sourceStatus: "summary_only",
  };
}
