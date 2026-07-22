import { ImageResponse } from "next/og";
import { buildReleaseIntelligence, type MetricMeaning } from "@/lib/release-intelligence";
import { formatReferencePeriod, formatReleaseDate } from "@/lib/release-format";
import { findHubRelease } from "@/lib/release-hub";

export const runtime = "nodejs";
export const revalidate = 3600;

const size = { width: 1200, height: 630 };

type ReleaseCardMetric = {
  label: string;
  display: string;
  change: string | null;
  direction: "up" | "down" | "neutral";
  meaning: MetricMeaning;
};

type ReleaseCardState = {
  title: string;
  topic: string;
  publisher: string;
  released: string;
  period: string;
  verdict: string;
  primary: ReleaseCardMetric | null;
  supporting: ReleaseCardMetric[];
  evidence: string;
};

function toCardMetric(metric: ReturnType<typeof buildReleaseIntelligence>["metrics"][number]): ReleaseCardMetric {
  return {
    label: metric.label,
    display: metric.display,
    change: metric.changeDisplay ?? null,
    direction: metric.direction,
    meaning: metric.meaning,
  };
}

async function getReleaseState(request: Request): Promise<ReleaseCardState | null> {
  const url = new URL(request.url);
  const source = url.searchParams.get("source");
  const slug = url.searchParams.get("slug");
  if (!source || !slug) return null;

  try {
    const release = await findHubRelease(
      source,
      slug,
      url.searchParams.get("date") ?? undefined,
      url.searchParams.get("url") ?? undefined,
    );
    if (!release) return null;
    const intelligence = buildReleaseIntelligence(release);
    const metrics = intelligence.metrics.map(toCardMetric);

    return {
      title: release.title,
      topic: release.affectedAreas[0] ?? "economy",
      publisher: release.publisher,
      released: formatReleaseDate(release.releaseDate),
      period: formatReferencePeriod(release.referencePeriod),
      verdict: intelligence.verdict,
      primary: metrics[0] ?? null,
      supporting: metrics.slice(1, 5),
      evidence: intelligence.evidenceLevel,
    };
  } catch {
    return null;
  }
}

function metricColour(meaning: MetricMeaning) {
  if (meaning === "positive") return "#34d399";
  if (meaning === "negative") return "#fb7185";
  return "#fbbf24";
}

function directionSymbol(direction: ReleaseCardMetric["direction"]) {
  if (direction === "up") return "↑";
  if (direction === "down") return "↓";
  return "→";
}

function ReleaseSocialCard({ state }: { state: ReleaseCardState | null }) {
  if (!state) {
    return (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#071315", color: "white", fontFamily: "Arial, sans-serif" }}>
        <div style={{ display: "flex", flexDirection: "column", width: 940 }}>
          <div style={{ display: "flex", color: "#ff9ca2", fontSize: 22, fontWeight: 900, letterSpacing: 2 }}>CANADA PULSE · OFFICIAL RELEASE</div>
          <div style={{ display: "flex", marginTop: 22, fontSize: 70, lineHeight: 1.04, fontWeight: 900 }}>The latest Canadian data, broken down.</div>
          <div style={{ display: "flex", marginTop: 26, color: "#cbd5e1", fontSize: 27 }}>Headline facts · visual evidence · provincial impact</div>
        </div>
      </div>
    );
  }

  const primaryColour = state.primary ? metricColour(state.primary.meaning) : "#8de7e9";
  const titleSize = state.title.length > 88 ? 39 : state.title.length > 58 ? 47 : 55;

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
        padding: "45px 54px 40px 70px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ position: "absolute", inset: "0 auto 0 0", width: 18, display: "flex", backgroundColor: "#d71920" }} />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <div style={{ width: 42, height: 42, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#d71920", fontSize: 18, fontWeight: 900 }}>CP</div>
          <div style={{ display: "flex", marginLeft: 14, fontSize: 25, fontWeight: 800 }}>Canada Pulse</div>
        </div>
        <div style={{ display: "flex", fontSize: 16, color: "#8de7e9", fontWeight: 800 }}>{state.evidence.toUpperCase()}</div>
      </div>

      <div style={{ display: "flex", flex: 1, marginTop: 35 }}>
        <div style={{ width: "64%", display: "flex", flexDirection: "column", justifyContent: "space-between", paddingRight: 44 }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", color: "#ff9ca2", fontSize: 18, fontWeight: 900, letterSpacing: 2 }}>{state.topic.toUpperCase()} · {state.publisher.toUpperCase()}</div>
            <div style={{ display: "flex", marginTop: 15, fontSize: titleSize, lineHeight: 1.04, fontWeight: 900, letterSpacing: -0.5 }}>{state.title}</div>
            {state.primary ? (
              <div style={{ display: "flex", alignItems: "flex-end", marginTop: 24 }}>
                <div style={{ display: "flex", fontSize: 84, lineHeight: 0.9, fontWeight: 900, letterSpacing: -2 }}>{state.primary.display}</div>
                <div style={{ display: "flex", flexDirection: "column", marginLeft: 20, paddingBottom: 2 }}>
                  <div style={{ display: "flex", color: primaryColour, fontSize: 25, fontWeight: 900 }}>{directionSymbol(state.primary.direction)} {state.primary.change ?? state.primary.label}</div>
                  {state.primary.change ? <div style={{ display: "flex", marginTop: 5, color: "#8ea1aa", fontSize: 15, fontWeight: 800 }}>{state.primary.label}</div> : null}
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", marginTop: 24, color: "#8de7e9", fontSize: 34, fontWeight: 900 }}>NEW OFFICIAL REPORT</div>
            )}
            <div style={{ display: "flex", marginTop: 18, color: "#cbd5e1", fontSize: 20, lineHeight: 1.35 }}>{state.verdict}</div>
          </div>
          <div style={{ display: "flex", color: "#71828c", fontSize: 15, fontWeight: 700 }}>Released {state.released} · Reference period {state.period}</div>
        </div>

        <div style={{ width: "36%", display: "flex", flexDirection: "column", borderLeft: "1px solid #24363a", paddingLeft: 34 }}>
          <div style={{ display: "flex", color: "#8ea1aa", fontSize: 15, fontWeight: 800, letterSpacing: 1.5 }}>WHAT MOVED</div>
          <div style={{ display: "flex", flexDirection: "column", marginTop: 12 }}>
            {(state.supporting.length ? state.supporting : state.primary ? [state.primary] : []).map((metric) => {
              const colour = metricColour(metric.meaning);
              return (
                <div key={`${metric.label}-${metric.display}`} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid #24363a", padding: "16px 0" }}>
                  <div style={{ display: "flex", flexDirection: "column", width: 225 }}>
                    <div style={{ display: "flex", color: "#cbd5e1", fontSize: 17, fontWeight: 800 }}>{metric.label}</div>
                    {metric.change ? <div style={{ display: "flex", marginTop: 5, color: colour, fontSize: 14, fontWeight: 800 }}>{directionSymbol(metric.direction)} {metric.change}</div> : null}
                  </div>
                  <div style={{ display: "flex", color: colour, fontSize: 23, fontWeight: 900 }}>{metric.display}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export async function GET(request: Request) {
  const state = await getReleaseState(request);
  return new ImageResponse(<ReleaseSocialCard state={state} />, {
    ...size,
    headers: {
      "Cache-Control": "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
