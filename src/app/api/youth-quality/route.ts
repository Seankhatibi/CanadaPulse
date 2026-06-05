import { NextResponse } from "next/server";
import {
  lifeStageLabels,
  qualitySnapshot,
  rankForStage,
  youthQualityProfiles,
  youthSnapshot,
} from "@/lib/youth-quality-data";

export async function GET() {
  return NextResponse.json({
    youthSnapshot,
    qualitySnapshot,
    provinces: youthQualityProfiles,
    lifeStageRankings: Object.keys(lifeStageLabels).reduce(
      (acc, stage) => ({
        ...acc,
        [stage]: rankForStage(stage as keyof typeof lifeStageLabels).map((profile) => ({
          province: profile.province,
          slug: profile.slug,
          score: profile.stageScores[stage as keyof typeof lifeStageLabels],
        })),
      }),
      {},
    ),
    sourceStatus: "source-ready-demo",
    nextLiveFeeds: [
      "Statistics Canada Labour Force Survey",
      "Statistics Canada Canadian Income Survey",
      "CMHC rental market data",
      "Statistics Canada crime and justice tables",
      "Statistics Canada Canadian Community Health Survey",
    ],
  });
}
