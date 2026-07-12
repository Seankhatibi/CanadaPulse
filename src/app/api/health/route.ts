import { NextResponse } from "next/server";
import { fetchCihiHealthSnapshot } from "@/lib/cihi-health";

export const dynamic = "force-dynamic";
export async function GET() { return NextResponse.json(await fetchCihiHealthSnapshot()); }
