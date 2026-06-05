import { NextResponse } from "next/server";
import {
  fetchStatCanDailyEntries,
  fetchStatCanDailyEntryFromUrl,
  findDailyEntryByHref,
  rankDailyEntries,
} from "@/lib/statcan-daily";
import { fetchStatCanReleaseData } from "@/lib/statcan-release-data";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const releaseUrl = url.searchParams.get("url");
  const entries = rankDailyEntries(await fetchStatCanDailyEntries().catch(() => []));
  const entry = releaseUrl ? findDailyEntryByHref(entries, releaseUrl) ?? await fetchStatCanDailyEntryFromUrl(releaseUrl) : entries.at(0);

  if (!entry) {
    return NextResponse.json({ error: "Release not found in current StatCan feed" }, { status: 404 });
  }

  const releaseData = await fetchStatCanReleaseData(entry);

  return NextResponse.json({
    entry,
    releaseData,
  });
}
