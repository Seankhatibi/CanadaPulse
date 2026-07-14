-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "GeographyType" AS ENUM ('COUNTRY', 'PROVINCE', 'TERRITORY', 'CITY');

-- CreateEnum
CREATE TYPE "IndicatorFrequency" AS ENUM ('DAILY', 'MONTHLY', 'QUARTERLY', 'ANNUAL');

-- CreateEnum
CREATE TYPE "IndicatorDirection" AS ENUM ('HIGHER_IS_BETTER', 'LOWER_IS_BETTER', 'NEUTRAL');

-- CreateEnum
CREATE TYPE "SourceApiType" AS ENUM ('STATCAN_WDS', 'STATCAN_DAILY', 'CMHC_TABLE', 'CKAN', 'XLSX', 'CSV', 'HTML', 'MANUAL');

-- CreateEnum
CREATE TYPE "SourceUpdateStatus" AS ENUM ('LIVE', 'SOURCE_LINKED', 'IMPORT_PENDING', 'NEEDS_SOURCE', 'LICENSED_SOURCE_NEEDED');

-- CreateEnum
CREATE TYPE "DataStatus" AS ENUM ('LIVE', 'STALE', 'FALLBACK', 'IMPORT_PENDING', 'ERROR');

-- CreateEnum
CREATE TYPE "RefreshStatus" AS ENUM ('RUNNING', 'SUCCESS', 'FAILED');

-- CreateEnum
CREATE TYPE "SummaryStatus" AS ENUM ('PENDING', 'GENERATED', 'FAILED', 'NOT_REQUIRED');

-- CreateTable
CREATE TABLE "Geography" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" "GeographyType" NOT NULL,
    "population" INTEGER,
    "capital" TEXT,
    "region" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Geography_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IndicatorCategory" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "IndicatorCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Indicator" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "frequency" "IndicatorFrequency" NOT NULL,
    "direction" "IndicatorDirection" NOT NULL DEFAULT 'NEUTRAL',
    "sourceId" TEXT,
    "isHot" BOOLEAN NOT NULL DEFAULT false,
    "isYouth" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Indicator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimeSeriesValue" (
    "id" TEXT NOT NULL,
    "indicatorId" TEXT NOT NULL,
    "geographyId" TEXT NOT NULL,
    "period" TIMESTAMP(3) NOT NULL,
    "value" DECIMAL(18,4) NOT NULL,
    "label" TEXT,
    "note" TEXT,
    "isEstimate" BOOLEAN NOT NULL DEFAULT false,
    "sourceDatasetId" TEXT,
    "sourceUrl" TEXT,
    "fetchedAt" TIMESTAMP(3),
    "sourcePeriod" TEXT,
    "confidence" DECIMAL(5,2),
    "dataStatus" "DataStatus" NOT NULL DEFAULT 'FALLBACK',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TimeSeriesValue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DataSource" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "publisher" TEXT NOT NULL,
    "refreshNote" TEXT NOT NULL,

    CONSTRAINT "DataSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SourceDataset" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "publisher" TEXT NOT NULL,
    "officialUrl" TEXT NOT NULL,
    "apiType" "SourceApiType" NOT NULL,
    "cadence" "IndicatorFrequency" NOT NULL,
    "licenseNote" TEXT NOT NULL,
    "updateStatus" "SourceUpdateStatus" NOT NULL DEFAULT 'SOURCE_LINKED',
    "latestKnownPeriod" TEXT,
    "lastCheckedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SourceDataset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IndicatorSourceMap" (
    "id" TEXT NOT NULL,
    "indicatorId" TEXT NOT NULL,
    "sourceDatasetId" TEXT NOT NULL,
    "sourceIndicatorKey" TEXT,
    "productId" TEXT,
    "vectorId" TEXT,
    "fieldPath" TEXT,
    "geographyMapping" JSONB,
    "unitConversion" TEXT,
    "transformRule" TEXT,
    "importStatus" "SourceUpdateStatus" NOT NULL DEFAULT 'SOURCE_LINKED',
    "priority" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IndicatorSourceMap_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DataRefreshRun" (
    "id" TEXT NOT NULL,
    "jobName" TEXT NOT NULL,
    "sourceDatasetId" TEXT,
    "status" "RefreshStatus" NOT NULL DEFAULT 'RUNNING',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "rowsFetched" INTEGER NOT NULL DEFAULT 0,
    "rowsChanged" INTEGER NOT NULL DEFAULT 0,
    "sourceVersion" TEXT,
    "errorPayload" JSONB,
    "metadata" JSONB,

    CONSTRAINT "DataRefreshRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReleaseEvent" (
    "id" TEXT NOT NULL,
    "sourceDatasetId" TEXT,
    "source" TEXT,
    "slug" TEXT,
    "publisher" TEXT,
    "releaseType" TEXT,
    "geographyLevel" TEXT,
    "status" TEXT,
    "metricCount" INTEGER NOT NULL DEFAULT 0,
    "title" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "releaseDate" TIMESTAMP(3) NOT NULL,
    "referencePeriod" TEXT,
    "affectedIndicators" JSONB,
    "facts" JSONB,
    "plainEnglishSummary" TEXT,
    "socialSummary" TEXT,
    "summaryStatus" "SummaryStatus" NOT NULL DEFAULT 'PENDING',
    "promoted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReleaseEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GeographyScore" (
    "id" TEXT NOT NULL,
    "geographyId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "grade" TEXT NOT NULL,
    "trend" TEXT NOT NULL,
    "period" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GeographyScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CityMetric" (
    "id" TEXT NOT NULL,
    "geographyId" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "metricSlug" TEXT NOT NULL,
    "value" DECIMAL(18,4) NOT NULL,
    "unit" TEXT NOT NULL,
    "period" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CityMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShareCard" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "geography" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "headline" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "score" INTEGER,
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShareCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserScenario" (
    "id" TEXT NOT NULL,
    "scenarioType" TEXT NOT NULL,
    "provinceSlug" TEXT NOT NULL,
    "city" TEXT,
    "householdSize" INTEGER NOT NULL,
    "annualIncome" DECIMAL(18,2) NOT NULL,
    "monthlyRent" DECIMAL(18,2),
    "monthlyCosts" JSONB NOT NULL,
    "affordability" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserScenario_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Geography_slug_key" ON "Geography"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Geography_code_key" ON "Geography"("code");

-- CreateIndex
CREATE INDEX "Geography_type_idx" ON "Geography"("type");

-- CreateIndex
CREATE UNIQUE INDEX "IndicatorCategory_slug_key" ON "IndicatorCategory"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Indicator_slug_key" ON "Indicator"("slug");

-- CreateIndex
CREATE INDEX "Indicator_categoryId_idx" ON "Indicator"("categoryId");

-- CreateIndex
CREATE INDEX "Indicator_sourceId_idx" ON "Indicator"("sourceId");

-- CreateIndex
CREATE INDEX "Indicator_isHot_isYouth_idx" ON "Indicator"("isHot", "isYouth");

-- CreateIndex
CREATE INDEX "TimeSeriesValue_geographyId_period_idx" ON "TimeSeriesValue"("geographyId", "period");

-- CreateIndex
CREATE INDEX "TimeSeriesValue_indicatorId_period_idx" ON "TimeSeriesValue"("indicatorId", "period");

-- CreateIndex
CREATE INDEX "TimeSeriesValue_sourceDatasetId_idx" ON "TimeSeriesValue"("sourceDatasetId");

-- CreateIndex
CREATE INDEX "TimeSeriesValue_dataStatus_idx" ON "TimeSeriesValue"("dataStatus");

-- CreateIndex
CREATE UNIQUE INDEX "TimeSeriesValue_indicatorId_geographyId_period_key" ON "TimeSeriesValue"("indicatorId", "geographyId", "period");

-- CreateIndex
CREATE UNIQUE INDEX "DataSource_slug_key" ON "DataSource"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "SourceDataset_slug_key" ON "SourceDataset"("slug");

-- CreateIndex
CREATE INDEX "SourceDataset_apiType_idx" ON "SourceDataset"("apiType");

-- CreateIndex
CREATE INDEX "SourceDataset_updateStatus_idx" ON "SourceDataset"("updateStatus");

-- CreateIndex
CREATE INDEX "IndicatorSourceMap_indicatorId_idx" ON "IndicatorSourceMap"("indicatorId");

-- CreateIndex
CREATE INDEX "IndicatorSourceMap_sourceDatasetId_idx" ON "IndicatorSourceMap"("sourceDatasetId");

-- CreateIndex
CREATE INDEX "IndicatorSourceMap_importStatus_idx" ON "IndicatorSourceMap"("importStatus");

-- CreateIndex
CREATE UNIQUE INDEX "IndicatorSourceMap_indicatorId_sourceDatasetId_priority_key" ON "IndicatorSourceMap"("indicatorId", "sourceDatasetId", "priority");

-- CreateIndex
CREATE INDEX "DataRefreshRun_jobName_startedAt_idx" ON "DataRefreshRun"("jobName", "startedAt");

-- CreateIndex
CREATE INDEX "DataRefreshRun_status_idx" ON "DataRefreshRun"("status");

-- CreateIndex
CREATE INDEX "DataRefreshRun_sourceDatasetId_idx" ON "DataRefreshRun"("sourceDatasetId");

-- CreateIndex
CREATE INDEX "ReleaseEvent_releaseDate_idx" ON "ReleaseEvent"("releaseDate");

-- CreateIndex
CREATE INDEX "ReleaseEvent_source_slug_releaseDate_idx" ON "ReleaseEvent"("source", "slug", "releaseDate");

-- CreateIndex
CREATE INDEX "ReleaseEvent_publisher_releaseDate_idx" ON "ReleaseEvent"("publisher", "releaseDate");

-- CreateIndex
CREATE INDEX "ReleaseEvent_promoted_idx" ON "ReleaseEvent"("promoted");

-- CreateIndex
CREATE INDEX "ReleaseEvent_summaryStatus_idx" ON "ReleaseEvent"("summaryStatus");

-- CreateIndex
CREATE UNIQUE INDEX "ReleaseEvent_sourceUrl_releaseDate_key" ON "ReleaseEvent"("sourceUrl", "releaseDate");

-- CreateIndex
CREATE INDEX "GeographyScore_score_idx" ON "GeographyScore"("score");

-- CreateIndex
CREATE UNIQUE INDEX "GeographyScore_geographyId_categoryId_period_key" ON "GeographyScore"("geographyId", "categoryId", "period");

-- CreateIndex
CREATE INDEX "CityMetric_geographyId_city_idx" ON "CityMetric"("geographyId", "city");

-- CreateIndex
CREATE INDEX "CityMetric_metricSlug_period_idx" ON "CityMetric"("metricSlug", "period");

-- CreateIndex
CREATE UNIQUE INDEX "ShareCard_slug_key" ON "ShareCard"("slug");

-- AddForeignKey
ALTER TABLE "Indicator" ADD CONSTRAINT "Indicator_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "IndicatorCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Indicator" ADD CONSTRAINT "Indicator_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "DataSource"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeSeriesValue" ADD CONSTRAINT "TimeSeriesValue_indicatorId_fkey" FOREIGN KEY ("indicatorId") REFERENCES "Indicator"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeSeriesValue" ADD CONSTRAINT "TimeSeriesValue_geographyId_fkey" FOREIGN KEY ("geographyId") REFERENCES "Geography"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeSeriesValue" ADD CONSTRAINT "TimeSeriesValue_sourceDatasetId_fkey" FOREIGN KEY ("sourceDatasetId") REFERENCES "SourceDataset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IndicatorSourceMap" ADD CONSTRAINT "IndicatorSourceMap_indicatorId_fkey" FOREIGN KEY ("indicatorId") REFERENCES "Indicator"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IndicatorSourceMap" ADD CONSTRAINT "IndicatorSourceMap_sourceDatasetId_fkey" FOREIGN KEY ("sourceDatasetId") REFERENCES "SourceDataset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DataRefreshRun" ADD CONSTRAINT "DataRefreshRun_sourceDatasetId_fkey" FOREIGN KEY ("sourceDatasetId") REFERENCES "SourceDataset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReleaseEvent" ADD CONSTRAINT "ReleaseEvent_sourceDatasetId_fkey" FOREIGN KEY ("sourceDatasetId") REFERENCES "SourceDataset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeographyScore" ADD CONSTRAINT "GeographyScore_geographyId_fkey" FOREIGN KEY ("geographyId") REFERENCES "Geography"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeographyScore" ADD CONSTRAINT "GeographyScore_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "IndicatorCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CityMetric" ADD CONSTRAINT "CityMetric_geographyId_fkey" FOREIGN KEY ("geographyId") REFERENCES "Geography"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
