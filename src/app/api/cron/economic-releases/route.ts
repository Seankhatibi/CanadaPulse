import {
  economicReleaseSchedule,
  getCanadaReleaseDate,
  getWeeklyPulseSummary,
  isCanadaReleaseToday,
  latestMajorEconomicRelease,
} from "@/lib/economic-releases";
import { fetchStatCanDailyEntries, rankDailyEntries } from "@/lib/statcan-daily";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const isProduction = process.env.NODE_ENV === "production";

  if (isProduction && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const now = new Date();
  const today = getCanadaReleaseDate(now);
  const dueSources = economicReleaseSchedule.filter((source) => source.nextReleaseDate === today);
  const dailyEntries = await fetchStatCanDailyEntries().catch(() => []);
  const rankedEntries = rankDailyEntries(dailyEntries).slice(0, 10);
  const weekday = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Toronto",
    weekday: "long",
  }).format(now);

  return Response.json({
    ok: true,
    checkedAt: now.toISOString(),
    canadaDate: today,
    mode: weekday === "Friday" ? "daily-check-and-friday-weekly-pulse" : "daily-release-check",
    dueSources,
    latestStatCanDailyEntries: rankedEntries,
    promotedRelease: isCanadaReleaseToday(latestMajorEconomicRelease.releaseDate, now)
      ? latestMajorEconomicRelease
      : null,
    homepageTopPayload: {
      showWhen: "Any major source-backed release is new today, or when an editor pins a major release.",
      currentFallback: latestMajorEconomicRelease,
      plainEnglishSummary: latestMajorEconomicRelease.plainEnglishSummary,
    },
    fridayWeeklyPayload: weekday === "Friday" ? getWeeklyPulseSummary(now) : null,
    nextActions: [
      "Check Statistics Canada Daily and release-calendar URLs for due official releases.",
      "Fetch linked StatCan tables for the latest reference period.",
      "Run deterministic metric rules to classify hot, weak, mixed, stable, and watch signals.",
      "Persist the release package, source URLs, table IDs, and homepage promotion flag.",
      "On Fridays, publish the weekly pulse summary block for homepage and Weekly Pulse.",
      "Optionally call an LLM for richer plain-English summary, social card copy, and myth-vs-reality prompts after source-backed facts are locked.",
    ],
    llmRequired: false,
    llmUsefulFor:
      "Richer narrative analysis, share-card headlines, and chart explanations. The core release detection, fetch, and promotion logic should remain deterministic and source-backed.",
  });
}
