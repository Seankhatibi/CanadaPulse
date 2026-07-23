import { ImageResponse } from "next/og";
import { buildProvinceExplorerData } from "@/lib/province-explorer-data";
import { getMultiSourceReleaseHub } from "@/lib/release-hub";

export const runtime = "nodejs";
export const revalidate = 3600;

const size = { width: 1200, height: 630 };

function parseIncome(value: string | null) {
  const income = Number(value);
  if (!value || !Number.isFinite(income)) return 60_000;
  return Math.round(Math.min(200_000, Math.max(30_000, income)) / 5_000) * 5_000;
}

async function getComparison(request: Request) {
  const url = new URL(request.url);
  const data = buildProvinceExplorerData(await getMultiSourceReleaseHub());
  const rent = data.categories.find((category) => category.id === "rent");
  if (!rent) return null;
  const left = rent.values.find((value) => value.slug === url.searchParams.get("left")) ?? rent.values.find((value) => value.slug === "ontario") ?? rent.values[0];
  const requestedRight = rent.values.find((value) => value.slug === url.searchParams.get("right")) ?? rent.values.find((value) => value.slug === "alberta") ?? rent.values[1];
  const right = requestedRight?.slug === left?.slug ? rent.values.find((value) => value.slug !== left?.slug) : requestedRight;
  if (!left || !right) return null;
  const income = parseIncome(url.searchParams.get("income"));
  const annualGap = Math.abs(left.value - right.value) * 12;
  const cheaper = left.value <= right.value ? left : right;
  const expensive = left.value > right.value ? left : right;
  return {
    left: { ...left, burden: left.value / (income / 12) * 100, remaining: income / 12 - left.value },
    right: { ...right, burden: right.value / (income / 12) * 100, remaining: income / 12 - right.value },
    income,
    annualGap,
    cheaper,
    expensive,
    source: rent.source,
    period: rent.period,
  };
}

function ComparisonCard({ comparison }: { comparison: Awaited<ReturnType<typeof getComparison>> }) {
  if (!comparison) {
    return <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#071315", color: "white", fontSize: 60, fontWeight: 900 }}>Canada Pulse</div>;
  }
  const maxRent = Math.max(comparison.left.value, comparison.right.value, 1);
  const provinces = [comparison.left, comparison.right];

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden", background: "#071315", color: "white", padding: "42px 62px 38px 76px", fontFamily: "Arial, sans-serif" }}>
      <div style={{ position: "absolute", inset: "0 auto 0 0", width: 18, display: "flex", background: "#d71920" }} />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <div style={{ width: 42, height: 42, display: "flex", alignItems: "center", justifyContent: "center", background: "#d71920", fontSize: 18, fontWeight: 900 }}>CP</div>
          <div style={{ display: "flex", marginLeft: 14, fontSize: 25, fontWeight: 800 }}>Canada Pulse</div>
        </div>
        <div style={{ display: "flex", color: "#8de7e9", fontSize: 17, fontWeight: 800 }}>OFFICIAL PROVINCE BATTLE</div>
      </div>

      <div style={{ display: "flex", flex: 1, marginTop: 34 }}>
        <div style={{ width: "56%", display: "flex", flexDirection: "column", justifyContent: "space-between", paddingRight: 46 }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", color: "#ff9ca2", fontSize: 19, fontWeight: 900, letterSpacing: 2 }}>{comparison.left.abbr} VS {comparison.right.abbr} · ${Math.round(comparison.income / 1_000)}K SALARY</div>
            <div style={{ display: "flex", marginTop: 15, fontSize: 43, lineHeight: 1.08, fontWeight: 900 }}>Where does your salary go further?</div>
            <div style={{ display: "flex", alignItems: "flex-end", marginTop: 22 }}>
              <div style={{ display: "flex", fontSize: 84, lineHeight: 0.9, fontWeight: 900 }}>${comparison.annualGap.toLocaleString("en-CA")}</div>
              <div style={{ display: "flex", marginLeft: 16, paddingBottom: 8, color: "#fcd34d", fontSize: 25, fontWeight: 900 }}>/ YEAR</div>
            </div>
            <div style={{ display: "flex", marginTop: 18, color: "#cbd5e1", fontSize: 21, lineHeight: 1.35 }}>{comparison.cheaper.province} is cheaper in average two-bedroom rent than {comparison.expensive.province}.</div>
          </div>
          <div style={{ display: "flex", color: "#71828c", fontSize: 16, fontWeight: 700 }}>{comparison.source} · {comparison.period} · gross-income scenario</div>
        </div>

        <div style={{ width: "44%", display: "flex", borderLeft: "1px solid #24363a", paddingLeft: 42, alignItems: "flex-end", justifyContent: "space-around" }}>
          {provinces.map((province) => (
            <div key={province.slug} style={{ width: 155, display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ display: "flex", color: province.slug === comparison.cheaper.slug ? "#6ee7b7" : "#fda4af", fontSize: 24, fontWeight: 900 }}>{province.burden.toFixed(0)}%</div>
              <div style={{ width: 92, height: 120 + province.value / maxRent * 130, display: "flex", alignItems: "flex-end", justifyContent: "center", background: province.slug === comparison.cheaper.slug ? "#10b981" : "#ef4444", marginTop: 12, paddingBottom: 18, fontSize: 18, fontWeight: 900 }}>{province.display}</div>
              <div style={{ display: "flex", marginTop: 14, fontSize: 23, fontWeight: 900 }}>{province.abbr}</div>
              <div style={{ display: "flex", marginTop: 5, color: "#8ea1aa", fontSize: 14, fontWeight: 700 }}>${Math.round(province.remaining).toLocaleString("en-CA")} left/mo</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export async function GET(request: Request) {
  const comparison = await getComparison(request);
  return new ImageResponse(<ComparisonCard comparison={comparison} />, {
    ...size,
    headers: { "Cache-Control": "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400" },
  });
}
