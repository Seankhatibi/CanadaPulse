import { notFound, redirect } from "next/navigation";
import {
  fetchStatCanDailyEntries,
  fetchStatCanDailyEntryFromUrl,
  findDailyEntryByHref,
  rankDailyEntries,
} from "@/lib/statcan-daily";
import { slugifyReleaseTitle } from "@/lib/release-hub";

export default async function ReleaseExplainerPage({
  searchParams,
}: {
  searchParams: Promise<{ url?: string }>;
}) {
  const { url } = await searchParams;
  const decodedUrl = url ? decodeURIComponent(url) : "";
  const entries = rankDailyEntries(await fetchStatCanDailyEntries().catch(() => []));
  const entry = decodedUrl
    ? findDailyEntryByHref(entries, decodedUrl) ?? await fetchStatCanDailyEntryFromUrl(decodedUrl).catch(() => null)
    : entries.at(0);

  if (!entry) notFound();

  const slug = slugifyReleaseTitle(entry.title);
  redirect(`/pulse-release/statcan/${slug}?url=${encodeURIComponent(entry.href)}`);
}
