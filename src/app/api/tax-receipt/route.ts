import { NextRequest, NextResponse } from "next/server";
import { estimateTaxReceipt } from "@/lib/tax-data";

export function GET(request: NextRequest) {
  const income = Number(request.nextUrl.searchParams.get("income") ?? "92000");
  const province = request.nextUrl.searchParams.get("province") ?? "canada";

  return NextResponse.json(estimateTaxReceipt(Number.isFinite(income) ? income : 92000, province));
}
