import { NextResponse } from "next/server";
import {
  equalizationGovernmentCards,
  federalExpenseBreakdown,
  federalFiscalSnapshot,
  federalRevenueBreakdown,
  federalTransferBreakdown,
  governmentRefreshPlan,
  governmentViralQuestions,
} from "@/lib/government-data";

export function GET() {
  return NextResponse.json({
    snapshot: federalFiscalSnapshot,
    revenues: federalRevenueBreakdown,
    expenses: federalExpenseBreakdown,
    transfers: federalTransferBreakdown,
    equalization: equalizationGovernmentCards,
    viralQuestions: governmentViralQuestions,
    refreshPlan: governmentRefreshPlan,
  });
}
