import { NextResponse } from "next/server";
import type { NormalizedRelease } from "@/lib/release-hub";
import { getMultiSourceReleaseHub } from "@/lib/release-hub";

function sanitizeRelease(release: NormalizedRelease) {
  const { icon, ...payload } = release;
  void icon;
  return payload;
}

export async function GET() {
  const hub = await getMultiSourceReleaseHub();

  return NextResponse.json({
    ...hub,
    todayQueue: hub.todayQueue.map(sanitizeRelease),
    housingWatch: sanitizeRelease(hub.housingWatch),
    promotedRelease: hub.promotedRelease ? sanitizeRelease(hub.promotedRelease) : null,
  });
}
