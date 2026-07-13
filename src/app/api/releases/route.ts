import { NextResponse } from "next/server";
import { filterReleaseArchive, getReleaseArchive } from "@/lib/release-archive";

export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  const url = new URL(request.url);
  const archive = await getReleaseArchive();
  const releases = filterReleaseArchive(archive, url.searchParams.get("q") ?? undefined, url.searchParams.get("publisher") ?? undefined, url.searchParams.get("status") ?? undefined);
  return NextResponse.json({ generatedAt: new Date().toISOString(), total: releases.length, releases });
}
