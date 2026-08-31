import type { NormalizedRelease, ReleaseArea, ReleaseChartPayload } from "@/lib/release-hub";

type BocReportFamily = {
  label: string;
  slug: string;
  url: string;
  areas: ReleaseArea[];
  importance: number;
  youthImpact: number;
  housingImpact: number;
};

type BocReportLink = {
  title: string;
  url: string;
  date: string;
  family: BocReportFamily;
  excerpt: string;
};

const reportFamilies: BocReportFamily[] = [
  {
    label: "Monetary Policy Report",
    slug: "mpr",
    url: "https://www.bankofcanada.ca/publications/mpr/",
    areas: ["rates", "inflation", "housing"],
    importance: 94,
    youthImpact: 88,
    housingImpact: 92,
  },
  {
    label: "Financial Stability Report",
    slug: "financial-stability-report",
    url: "https://www.bankofcanada.ca/publications/financial-stability-report/",
    areas: ["rates", "housing", "fiscal"],
    importance: 90,
    youthImpact: 76,
    housingImpact: 86,
  },
  {
    label: "Business Outlook Survey",
    slug: "business-outlook-survey",
    url: "https://www.bankofcanada.ca/publications/bos/",
    areas: ["inflation", "labour", "trade"],
    importance: 82,
    youthImpact: 72,
    housingImpact: 52,
  },
  {
    label: "Canadian Survey of Consumer Expectations",
    slug: "consumer-expectations",
    url: "https://www.bankofcanada.ca/publications/canadian-survey-of-consumer-expectations/",
    areas: ["inflation", "rates", "housing"],
    importance: 84,
    youthImpact: 84,
    housingImpact: 78,
  },
  {
    label: "Market Participants Survey",
    slug: "market-participants-survey",
    url: "https://www.bankofcanada.ca/publications/market-participants-survey/",
    areas: ["rates", "inflation"],
    importance: 76,
    youthImpact: 60,
    housingImpact: 65,
  },
  {
    label: "Financial System Survey",
    slug: "financial-system-survey",
    url: "https://www.bankofcanada.ca/publications/financial-system-survey/",
    areas: ["rates", "fiscal", "housing"],
    importance: 74,
    youthImpact: 58,
    housingImpact: 70,
  },
  {
    label: "Summary of deliberations",
    slug: "summary-deliberations",
    url: "https://www.bankofcanada.ca/publications/summary-governing-council-deliberations/",
    areas: ["rates", "inflation", "housing"],
    importance: 80,
    youthImpact: 78,
    housingImpact: 78,
  },
  {
    label: "Annual Report",
    slug: "annual-report",
    url: "https://www.bankofcanada.ca/publications/annual-reports-quarterly-financial-reports/",
    areas: ["fiscal", "rates"],
    importance: 62,
    youthImpact: 42,
    housingImpact: 35,
  },
  {
    label: "Disclosure of Climate-Related Risks",
    slug: "climate-risk-disclosure",
    url: "https://www.bankofcanada.ca/publications/disclosure-climate-related-risks/",
    areas: ["energy", "fiscal"],
    importance: 58,
    youthImpact: 62,
    housingImpact: 30,
  },
];

function decodeHtml(value: string) {
  return value
    .replace(/&#8212;|&mdash;/g, "—")
    .replace(/&#8211;|&ndash;/g, "–")
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
  return decodeHtml(value.replace(/<[^>]*>/g, " "));
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 90);
}

function readMetaContent(html: string, name: string) {
  const patterns = [
    new RegExp(`<meta[^>]+name=["']${name}["'][^>]+content=["']([^"']+)["']`, "i"),
    new RegExp(`<meta[^>]+property=["']${name}["'][^>]+content=["']([^"']+)["']`, "i"),
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) return decodeHtml(match[1]);
  }

  return "";
}

function parseReportDate(value: string) {
  const date = new Date(`${value} 12:00:00 GMT-0400`);
  return Number.isNaN(date.getTime()) ? value : date.toISOString().slice(0, 10);
}

function extractLatestReport(html: string, family: BocReportFamily): BocReportLink | null {
  const articlePattern =
    /<article[\s\S]*?<span[^>]+class=["'][^"']*media-date[^"']*["'][^>]*>([\s\S]*?)<\/span>[\s\S]*?<a[^>]+href=["']([^"']+)["'][^>]*data-content-type=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>[\s\S]*?<div[^>]+class=["'][^"']*media-excerpt[^"']*["'][^>]*>([\s\S]*?)<\/div>[\s\S]*?<\/article>/gi;
  const articles = [...html.matchAll(articlePattern)];
  const matching = articles.find((match) => stripTags(match[3]) === family.label) ?? articles[0];

  if (!matching) return null;

  return {
    date: parseReportDate(stripTags(matching[1])),
    url: matching[2],
    title: stripTags(matching[4]),
    excerpt: stripTags(matching[5]),
    family,
  };
}

function extractPercentSignals(text: string) {
  const matches = [...text.matchAll(/([+-]?\d+(?:\.\d+)?)\s*%/g)].slice(0, 6);

  const labelFor = (sentence: string, index: number) => {
    if (/inflation expectation/i.test(sentence)) return "Inflation expectations";
    if (/inflation|consumer price|\bcpi\b/i.test(sentence)) return "Inflation";
    if (/gross domestic product|\bgdp\b|economic growth|output/i.test(sentence)) return "Economic growth";
    if (/unemployment/i.test(sentence)) return "Unemployment";
    if (/employment|labour market/i.test(sentence)) return "Labour market";
    if (/policy rate|interest rate|overnight rate/i.test(sentence)) return "Interest rate";
    if (/wage|salary|compensation/i.test(sentence)) return "Wages";
    if (/mortgage|household debt|credit/i.test(sentence)) return "Household finance";
    return `Reported percentage ${index + 1}`;
  };

  const directionFor = (sentence: string, raw: string) => {
    if (raw.startsWith("+")) return "up" as const;
    if (raw.startsWith("-")) return "down" as const;
    if (/rose|risen|increased|accelerated|higher|grew|growth of/i.test(sentence)) return "up" as const;
    if (/fell|fallen|declined|decreased|eased|slowed|lower|contracted/i.test(sentence)) return "down" as const;
    return "neutral" as const;
  };

  return matches.map((match, index) => {
    const value = Number(match[1]);
    const sentence =
      text
        .split(/(?<=[.!?])\s+/)
        .find((part) => part.includes(match[0]))
        ?.trim() || `${match[0]} mentioned in the report.`;

    return {
      label: labelFor(sentence, index),
      value,
      display: `${match[1].startsWith("+") ? "+" : ""}${value}%`,
      direction: directionFor(sentence, match[1]),
      plainEnglish: sentence,
    } satisfies ReleaseChartPayload["points"][number];
  });
}

function themeSignals(report: BocReportLink, reportText: string): ReleaseChartPayload["points"] {
  const text = reportText.toLowerCase();
  const themes = [
    {
      label: "Mortgages and rates",
      pattern: /mortgage|housing|household debt|interest rate|policy rate/,
      plainEnglish: "The report discusses borrowing costs, mortgage renewals, housing or household debt.",
    },
    {
      label: "Inflation and prices",
      pattern: /inflation|prices|cpi|2%/,
      plainEnglish: "The report discusses inflation or prices, which can shape rate expectations and purchasing power.",
    },
    {
      label: "Growth and jobs",
      pattern: /growth|labour|employment|business|investment|gdp/,
      plainEnglish: "The report discusses economic growth, employment, business conditions or investment.",
    },
    {
      label: "Financial stability",
      pattern: /vulnerabilities|risk|stability|financial system|banks|credit/,
      plainEnglish: "The report discusses financial-system vulnerabilities, banks, credit or market risk.",
    },
  ];
  const points: ReleaseChartPayload["points"] = themes
    .filter((theme) => theme.pattern.test(text))
    .map((theme) => ({
      label: theme.label,
      value: 1,
      display: "Discussed",
      direction: "neutral",
      plainEnglish: theme.plainEnglish,
    }));

  if (report.family.label.includes("Consumer")) {
    points.unshift({
      label: "Household anxiety",
      value: 1,
      display: "Report focus",
      direction: "neutral",
      plainEnglish: "Consumer expectations reports are most useful for understanding how households feel about inflation, jobs and debt.",
    });
  }

  return points.length ? points : [{
    label: "Bank of Canada narrative",
    value: 1,
    display: "Report focus",
    direction: "neutral",
    plainEnglish: "Canada Pulse has not assigned a numerical score to this report's qualitative language.",
  }];
}

async function fetchReportPage(link: BocReportLink) {
  const response = await fetch(link.url, {
    headers: { "User-Agent": "Canada Pulse Bank of Canada report monitor" },
    next: { revalidate: 60 * 60, tags: ["canada-pulse-bank-of-canada"] },
    signal: AbortSignal.timeout(6000),
  });

  if (!response.ok) throw new Error(`Bank of Canada report fetch failed ${response.status}`);

  const html = await response.text();
  const description =
    readMetaContent(html, "description") ||
    readMetaContent(html, "og:description") ||
    readMetaContent(html, "twitter:description") ||
    link.excerpt;
  const publicationDate = readMetaContent(html, "publication_date") || link.date;
  const paragraphs = [...html.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)]
    .map((match) => stripTags(match[1]))
    .filter((paragraph) => paragraph.length > 60 && !paragraph.includes("Bank of Canada Museum"))
    .slice(0, 8);

  return {
    description,
    publicationDate,
    text: [description, ...paragraphs].join(" "),
  };
}

export async function fetchBankOfCanadaReportReleases(): Promise<NormalizedRelease[]> {
  const linkResults = await Promise.allSettled(
    reportFamilies.map(async (family) => {
        const response = await fetch(family.url, {
          headers: { "User-Agent": "Canada Pulse Bank of Canada report monitor" },
          next: { revalidate: 60 * 60 * 3, tags: ["canada-pulse-bank-of-canada"] },
          signal: AbortSignal.timeout(6000),
        });

        if (!response.ok) return null;
        return extractLatestReport(await response.text(), family);
      }),
  );
  const links = linkResults
    .flatMap((result) => (result.status === "fulfilled" && result.value ? [result.value] : []))
    .filter((link): link is BocReportLink => Boolean(link));

  const releaseResults = await Promise.allSettled(
    links.map(async (link) => {
      const report = await fetchReportPage(link).catch(() => ({
        description: link.excerpt,
        publicationDate: link.date,
        text: link.excerpt,
      }));
      const slug = slugify(link.title);
      const percentSignals = extractPercentSignals(report.text);
      const thematicSignals = themeSignals(link, report.text);
      const headlineFacts = [
        report.description,
        ...percentSignals.slice(0, 3).map((point) => `${point.label}: ${point.display}`),
      ];

      return {
        id: `bank-of-canada-report-${slug}`,
        slug,
        title: `Bank of Canada report: ${link.title}`,
        source: "bank-of-canada",
        publisher: "Bank of Canada",
        sourceUrl: link.url,
        href: `/pulse-release/bank-of-canada/${slug}`,
        releaseType: `bank-of-canada-${link.family.slug}`,
        releaseDate: report.publicationDate,
        referencePeriod: link.family.label,
        geographyLevel: "federal",
        affectedAreas: link.family.areas,
        headlineFacts,
        provinceBreakdown: [],
        chartPayloads: [
          ...(percentSignals.length ? [{
            title: `${link.family.label} reported percentages`,
            kind: "bar" as const,
            points: percentSignals,
          }] : []),
          {
            title: `${link.family.label} topics discussed`,
            kind: "qualitative" as const,
            points: thematicSignals,
          },
        ],
        sourceLinks: [
          { label: link.family.label, url: link.url },
          { label: "Bank of Canada publications", url: link.family.url },
          { label: "Bank of Canada RSS feeds", url: "https://www.bankofcanada.ca/rss-feeds/" },
        ],
        importanceScore: link.family.importance,
        youthImpactScore: link.family.youthImpact,
        housingImpactScore: link.family.housingImpact,
        promoted: link.family.importance >= 80,
        status: "live",
        plainEnglishSummary:
          `${link.family.label} is monitored by Canada Pulse. ${report.description} Topic labels describe what the report discusses; they are not numerical Bank of Canada scores.`,
        socialSummary: `${link.title}: ${report.description}`.slice(0, 240),
      } satisfies NormalizedRelease;
    }),
  );
  const releases = releaseResults.flatMap((result) => (result.status === "fulfilled" ? [result.value] : []));

  return releases.sort((a, b) => b.releaseDate.localeCompare(a.releaseDate) || b.importanceScore - a.importanceScore);
}
