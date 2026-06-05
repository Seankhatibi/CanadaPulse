import { NextResponse } from "next/server";
import {
  nationalExportSectors,
  nationalTradePartners,
  provinceTradeEnergyProfiles,
  tradeEnergySnapshot,
} from "@/lib/trade-energy-data";

export async function GET() {
  return NextResponse.json({
    snapshot: tradeEnergySnapshot,
    nationalExportSectors,
    nationalTradePartners,
    provinces: provinceTradeEnergyProfiles,
    sourceStatus: "source-ready-demo",
    nextLiveFeeds: [
      "Statistics Canada international merchandise trade",
      "Statistics Canada interprovincial trade and provincial economic accounts",
      "Canada Energy Regulator energy data",
      "Natural Resources Canada electricity and fuel datasets",
    ],
  });
}
