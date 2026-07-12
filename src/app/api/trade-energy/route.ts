import { NextResponse } from "next/server";
import { getResearchAreaApiPayload } from "@/lib/research-area-api";

export const dynamic = "force-dynamic";
export async function GET() {
  const [trade, energy] = await Promise.all([getResearchAreaApiPayload("trade"), getResearchAreaApiPayload("energy")]);
  return NextResponse.json({ status: "live", generatedAt: new Date().toISOString(), trade, energy });
}
