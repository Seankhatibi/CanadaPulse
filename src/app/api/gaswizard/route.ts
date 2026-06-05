import { NextResponse } from "next/server";
import { gasWizardFallbackPulse, getGasWizardPulse } from "@/lib/gaswizard";

export async function GET() {
  try {
    return NextResponse.json(await getGasWizardPulse());
  } catch (error) {
    return NextResponse.json(
      {
        ...gasWizardFallbackPulse,
        sourceMode: "fallback",
        error: error instanceof Error ? error.message : "GasWizard fetch failed",
      },
      { status: 502 },
    );
  }
}
