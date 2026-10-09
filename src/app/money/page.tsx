import { AppShell } from "@/components/app-shell";
import { MoneyExplorer } from "@/components/money-explorer";
import { fetchStatCanCpiSnapshot } from "@/lib/statcan-cpi";
import { getLifeSeries } from "@/lib/life-series";
export const dynamic = "force-dynamic";
export const metadata = { title: "Is your pay keeping up with prices?" };
export default async function MoneyPage() { const [cpi, series] = await Promise.all([fetchStatCanCpiSnapshot().catch(() => null), getLifeSeries()]); return <AppShell><MoneyExplorer cpi={cpi} wages={series.find((item) => item.id === "youth-wages")} /></AppShell>; }
