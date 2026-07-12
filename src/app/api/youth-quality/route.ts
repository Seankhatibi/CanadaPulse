import { NextResponse } from "next/server";
import { getResearchAreaApiPayload } from "@/lib/research-area-api";

export const dynamic = "force-dynamic";
export async function GET() { return NextResponse.json(await getResearchAreaApiPayload("youth")); }
