import { NextResponse } from "next/server";
import {
  nationalCapacitySignals,
  nationalPopulationFlows,
  nationalPopulationHeadlines,
  provincePopulationPressure,
} from "@/lib/population-data";

export function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const provinceSlug = searchParams.get("province");

  if (provinceSlug) {
    const province = provincePopulationPressure.find((item) => item.slug === provinceSlug);

    if (!province) {
      return NextResponse.json({ error: "Province not found" }, { status: 404 });
    }

    return NextResponse.json({
      geography: province,
      sourceMode: "official-source-ready-demo",
      refreshCadence: ["StatCan quarterly population estimates", "IRCC quarterly permit tables", "CMHC monthly completions"],
    });
  }

  return NextResponse.json({
    headlines: nationalPopulationHeadlines,
    flows: nationalPopulationFlows,
    capacity: nationalCapacitySignals,
    provinces: provincePopulationPressure,
    sourceMode: "official-source-ready-demo",
    refreshCadence: ["StatCan quarterly population estimates", "IRCC quarterly permit tables", "CMHC monthly completions"],
  });
}
