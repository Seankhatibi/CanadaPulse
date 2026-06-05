import { Landmark } from "lucide-react";
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

  return matches.map((match, index) => {
    const value = Number(match[1]);
    const sentence =
      text
        .split(/(?<=[.!?])\s+/)
        .find((part) => part.includes(match[0]))
        ?.trim() || `${match[0]} mentioned in the report.`;

    return {
      label: index === 0 ? "Main percentage signal" : `Percentage signal ${index + 1}`,
      value,
      display: `${value > 0 ? "+" : ""}${value}%`,
      direction: value > 0 ? "up" : value < 0 ? "down" : "neutral",
      plainEnglish: sentence,
    } satisfies ReleaseChartPayload["points"][number];
  });
}

function themeSignals(report: BocReportLink, reportText: string): ReleaseChartPayload["points"] {
  const text = reportText.toLowerCase();
  const points: ReleaseChartPayload["points"] = [
    {
      label: "Mortgage/rate pressure",
      value: /mortgage|housing|household debt|interest rate|policy rate/.test(text) ? 88 : 54,
      display: /mortgage|housing|household debt|interest rate|policy rate/.test(text) ? "High" : "Watch",
      direction: "up",
      plainEnglish: "Canada Pulse reads Bank reports through the lens of borrowing costs, mortgage renewals and household debt.",
    },
    {
      label: "Inflation pressure",
      value: /inflation|prices|cpi|2%/.test(text) ? 84 : 48,
      display: /inflation|prices|cpi|2%/.test(text) ? "High" : "Watch",
      direction: "up",
      plainEnglish: "Inflation language matters because it shapes rate expectations and household purchasing power.",
    },
    {
      label: "Growth/jobs signal",
      value: /growth|labour|employment|business|investment|gdp/.test(text) ? 72 : 42,
      display: /growth|labour|employment|business|investment|gdp/.test(text) ? "Active" : "Watch",
      direction: "neutral",
      plainEnglish: "Growth and jobs signals show whether Canadians should expect a stronger or weaker economy.",
    },
    {
      label: "Financial stability risk",
      value: /vulnerabilities|risk|stability|financial system|banks|credit/.test(text) ? 86 : 45,
      display: /vulnerabilities|risk|stability|financial system|banks|credit/.test(text) ? "Elevated" : "Watch",
      direction: "up",
      plainEnglish: "Financial stability language matters when household debt, banks or market stress are in the report.",
    },
  ];

  if (report.family.label.includes("Consumer")) {
    points[0] = {
      label: "Household anxiety",
      value: 88,
      display: "High",
      direction: "up",
      plainEnglish: "Consumer expectations reports are most useful for understanding how households feel about inflation, jobs and debt.",
    };
  }

  return points;
}

async function fetchReportPage(link: BocReportLink) {
  const response = await fetch(link.url, {
    headers: { "User-Agent": "Canada Pulse Bank of Canada report monitor" },
    next: { revalidate: 60 * 60 },
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
          next: { revalidate: 60 * 60 * 3 },
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
      const chartPoints = percentSignals.length ? [...percentSignals, ...thematicSignals].slice(0, 7) : thematicSignals;
      const headlineFacts = [
        report.description,
        ...chartPoints.slice(0, 3).map((point) => `${point.label}: ${point.display}`),
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
        provinceBreakdown: [
          {
            province: "Ontario",
            value: "Rate-sensitive",
            note: "Large mortgage and rent markets make Bank of Canada report language especially relevant.",
            score: link.family.housingImpact,
          },
          {
            province: "British Columbia",
            value: "Rate-sensitive",
            note: "High home prices increase exposure to mortgage and credit conditions.",
            score: Math.min(100, link.family.housingImpact + 2),
          },
          {
            province: "Alberta",
            value: "Growth-sensitive",
            note: "Energy, migration and credit conditions can shift provincial outlook quickly.",
            score: Math.max(55, link.family.importance - 8),
          },
        ],
        chartPayloads: [
          {
            title: `${link.family.label} signal map`,
            kind: "bar",
            points: chartPoints,
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
          `${link.family.label} is now monitored by Canada Pulse. ${report.description} The app turns the report language into rate, inflation, housing, growth and stability signals.`,
        socialSummary: `${link.title}: ${report.description}`.slice(0, 240),
        icon: Landmark,
      } satisfies NormalizedRelease;
    }),
  );
  const releases = releaseResults.flatMap((result) => (result.status === "fulfilled" ? [result.value] : []));

  return releases.sort((a, b) => b.releaseDate.localeCompare(a.releaseDate) || b.importanceScore - a.importanceScore);
}
