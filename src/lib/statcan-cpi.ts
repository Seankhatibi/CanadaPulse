import { fetchStatCanLatestVectorData } from "@/lib/etl/statcan-adapter";

type VectorDefinition = {
  vectorId: string;
  geography: string;
  product: string;
};

type VectorPoint = {
  refPer: string;
  value: number;
  releaseTime?: string;
};

type VectorResponse = {
  status?: string;
  object?: {
    vectorId?: number;
    vectorDataPoint?: VectorPoint[];
  };
};

export type CpiChange = {
  geography: string;
  product: string;
  vectorId: string;
  currentIndex: number;
  previousYearIndex: number;
  yearOverYearPct: number;
  previousMonthYoYPct: number | null;
  momentumChangePctPoints: number | null;
};

export type StatCanCpiSnapshot = {
  tableId: string;
  productId: string;
  sourceUrl: string;
  releaseDate: string;
  referencePeriod: string;
  referencePeriodRaw: string;
  canada: {
    allItems: CpiChange;
    food: CpiChange;
  };
  provinces: Array<{
    province: string;
    allItems: CpiChange;
    food: CpiChange;
  }>;
  components: CpiChange[];
  history: Array<{
    period: string;
    periodRaw: string;
    allItemsYoY: number;
    foodYoY: number;
  }>;
};

const tableId = "18-10-0004-01";
const productId = "18100004";
const sourceUrl = "https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=1810000401";

const provinceVectors: Array<[string, string, string]> = [
  ["Newfoundland and Labrador", "41691244", "41691245"],
  ["Prince Edward Island", "41691379", "41691380"],
  ["Nova Scotia", "41691513", "41691514"],
  ["New Brunswick", "41691648", "41691649"],
  ["Quebec", "41691783", "41691784"],
  ["Ontario", "41691919", "41691920"],
  ["Manitoba", "41692055", "41692056"],
  ["Saskatchewan", "41692191", "41692192"],
  ["Alberta", "41692327", "41692328"],
  ["British Columbia", "41692462", "41692463"],
];

const vectorDefinitions: VectorDefinition[] = [
  { geography: "Canada", product: "All-items", vectorId: "41690973" },
  { geography: "Canada", product: "Food", vectorId: "41690974" },
  { geography: "Canada", product: "Food purchased from stores", vectorId: "41690975" },
  { geography: "Canada", product: "Meat", vectorId: "41690976" },
  { geography: "Canada", product: "Dairy products and eggs", vectorId: "41690992" },
  { geography: "Canada", product: "Bakery and cereal products", vectorId: "41691000" },
  { geography: "Canada", product: "Fruit, fruit preparations and nuts", vectorId: "41691010" },
  { geography: "Canada", product: "Vegetables and vegetable preparations", vectorId: "41691020" },
  { geography: "Canada", product: "Food purchased from restaurants", vectorId: "41691046" },
  { geography: "Canada", product: "Shelter", vectorId: "41691050" },
  { geography: "Canada", product: "Rent", vectorId: "41691052" },
  { geography: "Canada", product: "Gasoline", vectorId: "41691136" },
  ...provinceVectors.flatMap(([geography, allItems, food]) => [
    { geography, product: "All-items", vectorId: allItems },
    { geography, product: "Food", vectorId: food },
  ]),
];

function periodLabel(period: string) {
  return new Intl.DateTimeFormat("en-CA", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${period}T12:00:00Z`));
}

function yearAgo(period: string) {
  const date = new Date(`${period}T12:00:00Z`);
  date.setUTCFullYear(date.getUTCFullYear() - 1);
  return date.toISOString().slice(0, 10);
}

function previousMonth(period: string) {
  const date = new Date(`${period}T12:00:00Z`);
  date.setUTCMonth(date.getUTCMonth() - 1);
  return date.toISOString().slice(0, 10);
}

function pctChange(current: number, previous: number) {
  return Number((((current - previous) / previous) * 100).toFixed(1));
}

function responseMap(raw: unknown) {
  const responses = raw as VectorResponse[];
  return new Map(
    responses.flatMap((response) => {
      const vectorId = response.object?.vectorId;
      const points = response.object?.vectorDataPoint;
      return response.status === "SUCCESS" && vectorId && points?.length ? [[String(vectorId), points] as const] : [];
    }),
  );
}

function changeFor(definition: VectorDefinition, points: Map<string, VectorPoint[]>, period: string): CpiChange {
  const series = points.get(definition.vectorId);
  const current = series?.find((point) => point.refPer === period);
  const previous = series?.find((point) => point.refPer === yearAgo(period));
  if (!current || !previous || previous.value === 0) {
    throw new Error(`CPI vector ${definition.vectorId} is missing ${period} or its year-ago comparison.`);
  }
  const priorMonth = series?.find((point) => point.refPer === previousMonth(period));
  const priorMonthYearAgo = series?.find((point) => point.refPer === yearAgo(previousMonth(period)));
  const previousMonthYoYPct = priorMonth && priorMonthYearAgo && priorMonthYearAgo.value !== 0
    ? pctChange(priorMonth.value, priorMonthYearAgo.value)
    : null;
  const yearOverYearPct = pctChange(current.value, previous.value);
  return {
    geography: definition.geography,
    product: definition.product,
    vectorId: definition.vectorId,
    currentIndex: current.value,
    previousYearIndex: previous.value,
    yearOverYearPct,
    previousMonthYoYPct,
    momentumChangePctPoints: previousMonthYoYPct === null ? null : Number((yearOverYearPct - previousMonthYoYPct).toFixed(1)),
  };
}

export async function fetchStatCanCpiSnapshot(): Promise<StatCanCpiSnapshot> {
  const raw = await fetchStatCanLatestVectorData(vectorDefinitions.map((definition) => definition.vectorId), 24);
  const points = responseMap(raw);
  if (points.size !== vectorDefinitions.length) {
    throw new Error(`StatCan CPI WDS returned ${points.size} of ${vectorDefinitions.length} required vectors.`);
  }

  const allItemsDefinition = vectorDefinitions[0];
  const foodDefinition = vectorDefinitions[1];
  const allItemsSeries = points.get(allItemsDefinition.vectorId) ?? [];
  const latest = allItemsSeries.at(-1);
  if (!latest) throw new Error("StatCan CPI all-items series is empty.");
  const period = latest.refPer;
  const canadaAllItems = changeFor(allItemsDefinition, points, period);
  const canadaFood = changeFor(foodDefinition, points, period);

  const provinces = provinceVectors.map(([province, allItemsVector, foodVector]) => ({
    province,
    allItems: changeFor({ geography: province, product: "All-items", vectorId: allItemsVector }, points, period),
    food: changeFor({ geography: province, product: "Food", vectorId: foodVector }, points, period),
  }));
  const components = vectorDefinitions.slice(2, 12).map((definition) => changeFor(definition, points, period));
  const foodSeries = points.get(foodDefinition.vectorId) ?? [];
  const foodByPeriod = new Map(foodSeries.map((point) => [point.refPer, point.value]));
  const allItemsByPeriod = new Map(allItemsSeries.map((point) => [point.refPer, point.value]));
  const history = allItemsSeries.slice(-12).flatMap((point) => {
    const previousAllItems = allItemsByPeriod.get(yearAgo(point.refPer));
    const currentFood = foodByPeriod.get(point.refPer);
    const previousFood = foodByPeriod.get(yearAgo(point.refPer));
    if (previousAllItems === undefined || currentFood === undefined || previousFood === undefined) return [];
    return [{
      period: periodLabel(point.refPer),
      periodRaw: point.refPer,
      allItemsYoY: pctChange(point.value, previousAllItems),
      foodYoY: pctChange(currentFood, previousFood),
    }];
  });

  if (provinces.length !== 10 || components.length !== 10 || history.length < 10) {
    throw new Error("StatCan CPI snapshot failed geography, component or history coverage checks.");
  }
  if (canadaAllItems.yearOverYearPct < -10 || canadaAllItems.yearOverYearPct > 20) {
    throw new Error(`StatCan CPI headline failed integrity range: ${canadaAllItems.yearOverYearPct}%.`);
  }

  return {
    tableId,
    productId,
    sourceUrl,
    releaseDate: latest.releaseTime?.slice(0, 10) ?? period,
    referencePeriod: periodLabel(period),
    referencePeriodRaw: period,
    canada: { allItems: canadaAllItems, food: canadaFood },
    provinces,
    components,
    history,
  };
}
