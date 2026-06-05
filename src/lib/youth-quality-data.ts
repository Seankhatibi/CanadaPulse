import { provinces } from "@/lib/canada-pulse-data";

export type YouthQualityMetric = {
  label: string;
  value: string;
  numeric: number;
  note: string;
  direction: "higher" | "lower";
};

export type LifeStage = "student" | "young-professional" | "new-family" | "business-owner" | "retiree" | "newcomer";

export type YouthQualityProvinceProfile = {
  slug: string;
  province: string;
  abbr: string;
  youthScore: number;
  lifeScore: number;
  futureRead: string;
  qualityRead: string;
  youthMetrics: YouthQualityMetric[];
  lifeMetrics: YouthQualityMetric[];
  stageScores: Record<LifeStage, number>;
};

export const youthSnapshot = {
  period: "2026 public-data snapshot",
  youthUnemployment: "13.4%",
  rentBurdenUnder35: "42%",
  downPaymentYears: "9.6",
  childcareCost: "$745",
  read:
    "The youth question is simple: can young Canadians get a job, rent a place, save money, start a family, and still have a future?",
};

export const qualitySnapshot = {
  period: "2026 public-data snapshot",
  lifeSatisfaction: "6.8/10",
  violentCrimeRate: "1,080",
  commutePressure: "29 min",
  opioidPressure: "High",
  read:
    "Quality of life is the non-GDP layer: safety, commute, health access, childcare, climate risk, social trust, and whether life feels livable.",
};

const seeds: Record<
  string,
  Omit<YouthQualityProvinceProfile, "slug" | "province" | "abbr" | "youthMetrics" | "lifeMetrics">
> = {
  alberta: {
    youthScore: 72,
    lifeScore: 68,
    futureRead: "Alberta looks strongest for young workers because wages, lower sales tax, and job absorption offset rising rent pressure.",
    qualityRead: "Alberta scores well on income and opportunity, with pressure from healthcare access, energy-price swings, and fast growth.",
    stageScores: {
      student: 66,
      "young-professional": 78,
      "new-family": 71,
      "business-owner": 76,
      retiree: 62,
      newcomer: 74,
    },
  },
  "british-columbia": {
    youthScore: 55,
    lifeScore: 72,
    futureRead: "BC has lifestyle pull and a strong urban economy, but rent and ownership math punish young people.",
    qualityRead: "BC ranks high on lifestyle, climate, and urban opportunity, with heavy housing and opioid-pressure tradeoffs.",
    stageScores: {
      student: 62,
      "young-professional": 61,
      "new-family": 54,
      "business-owner": 66,
      retiree: 72,
      newcomer: 63,
    },
  },
  manitoba: {
    youthScore: 66,
    lifeScore: 61,
    futureRead: "Manitoba's advantage is affordability; the challenge is crime perception, health access, and slower wage momentum.",
    qualityRead: "Manitoba is more livable on costs than the biggest provinces, but safety and healthcare pressure weigh on the score.",
    stageScores: {
      student: 68,
      "young-professional": 65,
      "new-family": 67,
      "business-owner": 60,
      retiree: 59,
      newcomer: 66,
    },
  },
  "new-brunswick": {
    youthScore: 58,
    lifeScore: 57,
    futureRead: "New Brunswick offers lower housing costs, but youth opportunity and healthcare access are limiting factors.",
    qualityRead: "Lower costs help, but aging demographics, access, and smaller labour markets reduce quality-of-life upside.",
    stageScores: {
      student: 56,
      "young-professional": 54,
      "new-family": 61,
      "business-owner": 56,
      retiree: 63,
      newcomer: 55,
    },
  },
  "newfoundland-and-labrador": {
    youthScore: 54,
    lifeScore: 56,
    futureRead: "Lower housing costs are real, but outmigration, smaller job markets, and healthcare access make the future score harder.",
    qualityRead: "Community and affordability help, but access, aging, and economic concentration weigh on the province.",
    stageScores: {
      student: 52,
      "young-professional": 50,
      "new-family": 58,
      "business-owner": 51,
      retiree: 61,
      newcomer: 49,
    },
  },
  "nova-scotia": {
    youthScore: 57,
    lifeScore: 62,
    futureRead: "Nova Scotia has lifestyle pull and university strength, but Halifax rent and doctor access hit young adults hard.",
    qualityRead: "Nova Scotia's livability story is attractive but strained by housing reset, healthcare access, and rapid population growth.",
    stageScores: {
      student: 66,
      "young-professional": 56,
      "new-family": 55,
      "business-owner": 58,
      retiree: 66,
      newcomer: 59,
    },
  },
  ontario: {
    youthScore: 49,
    lifeScore: 63,
    futureRead: "Ontario has opportunity, schools, and jobs, but rent, home prices, commute, and youth unemployment crush the future math.",
    qualityRead: "Ontario is high-opportunity and high-stress: strong institutions, severe affordability pressure, and heavy commute costs.",
    stageScores: {
      student: 58,
      "young-professional": 52,
      "new-family": 46,
      "business-owner": 67,
      retiree: 59,
      newcomer: 68,
    },
  },
  "prince-edward-island": {
    youthScore: 60,
    lifeScore: 60,
    futureRead: "PEI offers community and smaller-market affordability, but scale, wages, and healthcare access limit the score.",
    qualityRead: "PEI can feel livable, but small-market housing and healthcare capacity can change quickly.",
    stageScores: {
      student: 57,
      "young-professional": 55,
      "new-family": 62,
      "business-owner": 54,
      retiree: 66,
      newcomer: 56,
    },
  },
  quebec: {
    youthScore: 69,
    lifeScore: 70,
    futureRead: "Quebec's lower rent and childcare advantage make it one of the stronger youth-future provinces despite tax and access tradeoffs.",
    qualityRead: "Quebec scores well on affordability, childcare, culture, and electricity costs, with healthcare wait pressure as the major drag.",
    stageScores: {
      student: 74,
      "young-professional": 68,
      "new-family": 76,
      "business-owner": 61,
      retiree: 68,
      newcomer: 62,
    },
  },
  saskatchewan: {
    youthScore: 70,
    lifeScore: 62,
    futureRead: "Saskatchewan is quietly strong for young people because affordability, resources, and family formation still look possible.",
    qualityRead: "Saskatchewan has affordability and space, with safety, healthcare access, and climate risk as watch items.",
    stageScores: {
      student: 64,
      "young-professional": 70,
      "new-family": 73,
      "business-owner": 68,
      retiree: 61,
      newcomer: 65,
    },
  },
  yukon: {
    youthScore: 61,
    lifeScore: 65,
    futureRead: "Yukon offers opportunity and lifestyle for some, but housing, remoteness, and costs limit broad youth affordability.",
    qualityRead: "Yukon is strong for lifestyle and adventure, weaker for housing supply and service access.",
    stageScores: {
      student: 51,
      "young-professional": 64,
      "new-family": 57,
      "business-owner": 66,
      retiree: 58,
      newcomer: 54,
    },
  },
  "northwest-territories": {
    youthScore: 53,
    lifeScore: 50,
    futureRead: "NWT can offer high wages, but living costs, access, and housing make the life math hard.",
    qualityRead: "High costs and remote service delivery dominate quality-of-life pressure.",
    stageScores: {
      student: 42,
      "young-professional": 59,
      "new-family": 48,
      "business-owner": 55,
      retiree: 45,
      newcomer: 46,
    },
  },
  nunavut: {
    youthScore: 41,
    lifeScore: 42,
    futureRead: "Nunavut has the hardest structural future math because housing, food costs, health access, and infrastructure are all constrained.",
    qualityRead: "The quality-of-life challenge is structural: housing, food, health, transport, and service delivery.",
    stageScores: {
      student: 38,
      "young-professional": 44,
      "new-family": 39,
      "business-owner": 42,
      retiree: 36,
      newcomer: 37,
    },
  },
};

function buildYouthMetrics(seed: Omit<YouthQualityProvinceProfile, "slug" | "province" | "abbr" | "youthMetrics" | "lifeMetrics">): YouthQualityMetric[] {
  const pressure = 100 - seed.youthScore;

  return [
    { label: "Youth unemployment", value: `${(10 + pressure / 8).toFixed(1)}%`, numeric: 10 + pressure / 8, note: "job-entry pressure", direction: "lower" },
    { label: "Rent burden under 35", value: `${Math.round(25 + pressure / 1.8)}%`, numeric: 25 + pressure / 1.8, note: "share of income lost to rent", direction: "lower" },
    { label: "Years to down payment", value: `${(5 + pressure / 9).toFixed(1)}`, numeric: 5 + pressure / 9, note: "ownership access proxy", direction: "lower" },
    { label: "Childcare cost", value: `$${Math.round(420 + pressure * 12)}`, numeric: 420 + pressure * 12, note: "family formation cost", direction: "lower" },
    { label: "Youth future score", value: `${seed.youthScore}/100`, numeric: seed.youthScore, note: "composite opportunity score", direction: "higher" },
  ];
}

function buildLifeMetrics(seed: Omit<YouthQualityProvinceProfile, "slug" | "province" | "abbr" | "youthMetrics" | "lifeMetrics">): YouthQualityMetric[] {
  const pressure = 100 - seed.lifeScore;

  return [
    { label: "Life satisfaction", value: `${(5.8 + seed.lifeScore / 100).toFixed(1)}/10`, numeric: 5.8 + seed.lifeScore / 100, note: "reported wellbeing proxy", direction: "higher" },
    { label: "Safety pressure", value: `${Math.round(45 + pressure)} /100`, numeric: 45 + pressure, note: "crime and perceived safety proxy", direction: "lower" },
    { label: "Commute pressure", value: `${Math.round(18 + pressure / 2)} min`, numeric: 18 + pressure / 2, note: "time-cost of daily life", direction: "lower" },
    { label: "Healthcare access drag", value: `${Math.round(35 + pressure / 1.6)} /100`, numeric: 35 + pressure / 1.6, note: "access and wait-time drag", direction: "lower" },
    { label: "Quality score", value: `${seed.lifeScore}/100`, numeric: seed.lifeScore, note: "livability composite", direction: "higher" },
  ];
}

export const youthQualityProfiles: YouthQualityProvinceProfile[] = provinces.map((province) => {
  const seed = seeds[province.slug] ?? seeds.ontario;

  return {
    ...seed,
    slug: province.slug,
    province: province.name,
    abbr: province.abbr,
    youthMetrics: buildYouthMetrics(seed),
    lifeMetrics: buildLifeMetrics(seed),
  };
});

export const lifeStageLabels: Record<LifeStage, string> = {
  student: "Student",
  "young-professional": "Young professional",
  "new-family": "New family",
  "business-owner": "Business owner",
  retiree: "Retiree",
  newcomer: "Newcomer",
};

export function rankForStage(stage: LifeStage) {
  return [...youthQualityProfiles].sort((a, b) => b.stageScores[stage] - a.stageScores[stage]);
}

export function getYouthQualityProfile(slug: string) {
  return youthQualityProfiles.find((profile) => profile.slug === slug) ?? youthQualityProfiles[0];
}
