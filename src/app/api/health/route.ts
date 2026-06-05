import { NextResponse } from "next/server";
import {
  healthSnapshot,
  nationalDiseaseBurden,
  nationalSystemMetrics,
  provinceHealthProfiles,
} from "@/lib/health-data";

export async function GET() {
  return NextResponse.json({
    snapshot: healthSnapshot,
    nationalSystemMetrics,
    nationalDiseaseBurden,
    provinces: provinceHealthProfiles,
    sourceStatus: "source-ready-demo",
    nextLiveFeeds: [
      "CIHI national health expenditure data",
      "CIHI health system indicators and wait-time data",
      "PHAC Canadian Chronic Disease Surveillance System",
      "Statistics Canada Canadian Community Health Survey",
    ],
  });
}
