import { getCanadaReleaseDate } from "@/lib/economic-releases";
import { fetchStatCanDailyEntries, rankDailyEntries } from "@/lib/statcan-daily";
import { buildLiveWeeklyPulseSummary } from "@/lib/live-weekly-pulse";
import { getMultiSourceReleaseHub } from "@/lib/release-hub";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const isProduction = process.env.NODE_ENV === "production";
  const cronSecret = process.env.CRON_SECRET;

  if (isProduction && (!cronSecret || authHeader !== `Bearer ${cronSecret}`)) {
    return new Response("Unauthorized", { status: 401 });
  }

  const now = new Date();
  const today = getCanadaReleaseDate(now);
  const dailyEntries = await fetchStatCanDailyEntries().catch(() => []);
  const rankedEntries = rankDailyEntries(dailyEntries).slice(0, 10);
  const releaseHub = await getMultiSourceReleaseHub();
  const promoted = releaseHub.promotedRelease;
  const weekday = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Toronto",
    weekday: "long",
  }).format(now);

  return Response.json({
    ok: true,
    checkedAt: now.toISOString(),
    canadaDate: today,
    mode: weekday === "Friday" ? "daily-check-and-friday-weekly-pulse" : "daily-release-check",
    latestStatCanDailyEntries: rankedEntries,
    promotedRelease: promoted?.releaseDate === today ? promoted : null,
    homepageTopPayload: {
      showWhen: "Any major source-backed release is new today, or the latest consequential release remains current.",
      currentLead: promoted,
      plainEnglishSummary: promoted?.plainEnglishSummary ?? null,
    },
    fridayWeeklyPayload: weekday === "Friday" ? buildLiveWeeklyPulseSummary(releaseHub, now) : null,
  });
}
