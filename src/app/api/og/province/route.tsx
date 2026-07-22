import { ImageResponse } from "next/og";
import { buildProvinceExplorerData } from "@/lib/province-explorer-data";
import { getMultiSourceReleaseHub } from "@/lib/release-hub";

export const runtime = "nodejs";
export const revalidate = 3600;

const size = { width: 1200, height: 630 };

type CardState = {
  province: string;
  abbr: string;
  display: string;
  note: string;
  rank: number;
  rankOutOf: number;
  category: string;
  question: string;
  source: string;
  period: string;
  accent: string;
  bars: Array<{ abbr: string; height: number; selected: boolean }>;
};

async function getCardState(request: Request): Promise<CardState | null> {
  const url = new URL(request.url);
  const provinceSlug = url.searchParams.get("province");
  const topic = url.searchParams.get("topic");
  if (!provinceSlug || !topic) return null;

  try {
    const data = buildProvinceExplorerData(await getMultiSourceReleaseHub());
    const category = data.categories.find((item) => item.id === topic);
    const value = category?.values.find((item) => item.slug === provinceSlug);
    if (!category || !value) return null;

    return {
      province: value.province,
      abbr: value.abbr,
      display: value.display,
      note: value.note,
      rank: value.rank,
      rankOutOf: value.rankOutOf,
      category: category.label,
      question: category.question,
      source: category.source,
      period: category.period,
      accent: category.highColor,
      bars: category.values
        .slice()
        .sort((left, right) => left.rank - right.rank)
        .map((item) => ({
          abbr: item.abbr,
          height: 42 + item.intensity * 160,
          selected: item.slug === provinceSlug,
        })),
    };
  } catch {
    return null;
  }
}

function SocialCard({ state }: { state: CardState | null }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
        backgroundColor: "#071315",
        color: "#ffffff",
        padding: "48px 54px 42px 70px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ position: "absolute", inset: "0 auto 0 0", width: 18, display: "flex", backgroundColor: "#d71920" }} />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <div style={{ width: 42, height: 42, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#d71920", fontSize: 18, fontWeight: 900 }}>CP</div>
          <div style={{ display: "flex", marginLeft: 14, fontSize: 25, fontWeight: 800 }}>Canada Pulse</div>
        </div>
        <div style={{ display: "flex", fontSize: 17, color: "#8de7e9", fontWeight: 700 }}>OFFICIAL DATA · PROVINCE BY PROVINCE</div>
      </div>

      {state ? (
        <div style={{ display: "flex", flex: 1, marginTop: 42 }}>
          <div style={{ width: "57%", display: "flex", flexDirection: "column", justifyContent: "space-between", paddingRight: 46 }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", color: "#ff9ca2", fontSize: 19, fontWeight: 900, letterSpacing: 2.2 }}>{state.province.toUpperCase()} · {state.category.toUpperCase()}</div>
              <div style={{ display: "flex", marginTop: 16, fontSize: 42, lineHeight: 1.08, fontWeight: 900 }}>{state.question}</div>
              <div style={{ display: "flex", alignItems: "flex-end", marginTop: 22 }}>
                <div style={{ display: "flex", fontSize: 92, lineHeight: 0.9, fontWeight: 900, letterSpacing: -2 }}>{state.display}</div>
                <div style={{ display: "flex", marginLeft: 22, paddingBottom: 7, color: state.accent, fontSize: 27, fontWeight: 900 }}>#{state.rank} of {state.rankOutOf}</div>
              </div>
              <div style={{ display: "flex", marginTop: 18, color: "#cbd5e1", fontSize: 21, lineHeight: 1.35 }}>{state.note}</div>
            </div>
            <div style={{ display: "flex", color: "#71828c", fontSize: 16, fontWeight: 700 }}>{state.source} · {state.period}</div>
          </div>

          <div style={{ width: "43%", display: "flex", flexDirection: "column", justifyContent: "flex-end", borderLeft: "1px solid #24363a", paddingLeft: 38 }}>
            <div style={{ display: "flex", color: "#8ea1aa", fontSize: 16, fontWeight: 800, letterSpacing: 1.5 }}>NATIONAL RANKING</div>
            <div style={{ height: 260, display: "flex", alignItems: "flex-end", marginTop: 18 }}>
              {state.bars.map((bar) => (
                <div key={bar.abbr} style={{ width: 39, height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", marginRight: 3 }}>
                  <div style={{ width: 27, height: bar.height, display: "flex", backgroundColor: bar.selected ? state.accent : "#31464b", borderTop: bar.selected ? "5px solid #ffffff" : "0 solid transparent" }} />
                  <div style={{ display: "flex", marginTop: 9, color: bar.selected ? "#ffffff" : "#71828c", fontSize: 13, fontWeight: 900 }}>{bar.abbr}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ width: "65%", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", color: "#ff9ca2", fontSize: 20, fontWeight: 900, letterSpacing: 2.4 }}>YOUR CANADA RIGHT NOW</div>
            <div style={{ display: "flex", marginTop: 18, fontSize: 64, lineHeight: 1.03, fontWeight: 900, letterSpacing: -1.5 }}>Can you build a life in your province?</div>
            <div style={{ display: "flex", marginTop: 24, color: "#cbd5e1", fontSize: 24 }}>Current official numbers, made understandable.</div>
          </div>
          <div style={{ width: "30%", display: "flex", flexDirection: "column", borderLeft: "1px solid #24363a", paddingLeft: 42 }}>
            {["JOBS", "RENT", "INFLATION", "NEW HOMES", "NEWCOMERS"].map((label, index) => (
              <div key={label} style={{ display: "flex", alignItems: "center", borderTop: "1px solid #24363a", padding: "13px 0", color: index === 0 ? "#8de7e9" : "#ffffff", fontSize: 21, fontWeight: 900 }}>
                <div style={{ width: 9, height: 9, display: "flex", marginRight: 14, backgroundColor: index === 0 ? "#22d3ee" : "#d71920" }} />
                {label}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export async function GET(request: Request) {
  const state = await getCardState(request);
  return new ImageResponse(<SocialCard state={state} />, {
    ...size,
    headers: {
      "Cache-Control": "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
