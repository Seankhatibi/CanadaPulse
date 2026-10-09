import { getPolicyFeed } from "@/lib/policy-data";
export const dynamic = "force-dynamic";
export async function GET() { const feed = await getPolicyFeed(); return Response.json(feed, { status: feed.status === "loaded" ? 200 : 503 }); }
