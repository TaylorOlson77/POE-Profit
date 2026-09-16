-- CreateEnum
CREATE TYPE "Game" AS ENUM ('POE2', 'POE1');

-- CreateEnum
CREATE TYPE "DurationMethod" AS ENUM ('EXTRAPOLATED', 'OBSERVED', 'MANUAL');

-- CreateEnum
CREATE TYPE "PriceSource" AS ENUM ('MANUAL');

-- CreateEnum
CREATE TYPE "ValuationType" AS ENUM ('ACTUAL_PAID');

-- CreateTable
CREATE TABLE "Strategy" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "game" "Game" NOT NULL,
    "description" TEXT NOT NULL,
    "mapNotes" TEXT,
    "mapUnitCostChaos" DECIMAL(20,8) NOT NULL,
    "estimatedCostPerMapChaos" DECIMAL(20,8) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Strategy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StrategyEnhancementLine" (
    "id" TEXT NOT NULL,
    "strategyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "modifierNotes" TEXT,
    "quantity" DECIMAL(20,8) NOT NULL,
    "unitCostChaos" DECIMAL(20,8) NOT NULL,
    "lineTotalChaos" DECIMAL(20,8) NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "StrategyEnhancementLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MapSession" (
    "id" TEXT NOT NULL,
    "strategyId" TEXT NOT NULL,
    "mapsCompleted" INTEGER NOT NULL,
    "mapUnitCostChaos" DECIMAL(20,8) NOT NULL,
    "divineRateChaos" DECIMAL(20,8) NOT NULL,
    "notes" TEXT,
    "durationMethod" "DurationMethod" NOT NULL,
    "sampleMapsCompleted" INTEGER,
    "sampleDurationMinutes" DECIMAL(20,8),
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "manualDurationMinutes" DECIMAL(20,8),
    "mapInvestmentChaos" DECIMAL(20,8) NOT NULL,
    "totalInvestmentChaos" DECIMAL(20,8) NOT NULL,
    "totalRevenueChaos" DECIMAL(20,8) NOT NULL,
    "profitChaos" DECIMAL(20,8) NOT NULL,
    "effectiveDurationMinutes" DECIMAL(20,8) NOT NULL,
    "profitPerHourChaos" DECIMAL(20,8),
    "profitPerMapChaos" DECIMAL(20,8),
    "mapsPerHour" DECIMAL(20,8),
    "roiPercent" DECIMAL(20,8),
    "profitDivineApprox" DECIMAL(20,8),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MapSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MapSessionInvestmentLine" (
    "id" TEXT NOT NULL,
    "mapSessionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "quantity" DECIMAL(20,8) NOT NULL,
    "unitValueChaos" DECIMAL(20,8) NOT NULL,
    "priceRecordedAt" TIMESTAMP(3) NOT NULL,
    "priceSource" "PriceSource" NOT NULL DEFAULT 'MANUAL',
    "valuationType" "ValuationType" NOT NULL DEFAULT 'ACTUAL_PAID',
    "lineTotalChaos" DECIMAL(20,8) NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "MapSessionInvestmentLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MapSessionRevenueLine" (
    "id" TEXT NOT NULL,
    "mapSessionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "quantity" DECIMAL(20,8) NOT NULL,
    "unitValueChaos" DECIMAL(20,8) NOT NULL,
    "priceRecordedAt" TIMESTAMP(3) NOT NULL,
    "priceSource" "PriceSource" NOT NULL DEFAULT 'MANUAL',
    "valuationType" "ValuationType" NOT NULL DEFAULT 'ACTUAL_PAID',
    "lineTotalChaos" DECIMAL(20,8) NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "MapSessionRevenueLine_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StrategyEnhancementLine_strategyId_idx" ON "StrategyEnhancementLine"("strategyId");

-- CreateIndex
CREATE INDEX "MapSession_strategyId_idx" ON "MapSession"("strategyId");

-- CreateIndex
CREATE INDEX "MapSessionInvestmentLine_mapSessionId_idx" ON "MapSessionInvestmentLine"("mapSessionId");

-- CreateIndex
CREATE INDEX "MapSessionRevenueLine_mapSessionId_idx" ON "MapSessionRevenueLine"("mapSessionId");

-- AddForeignKey
ALTER TABLE "StrategyEnhancementLine" ADD CONSTRAINT "StrategyEnhancementLine_strategyId_fkey" FOREIGN KEY ("strategyId") REFERENCES "Strategy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MapSession" ADD CONSTRAINT "MapSession_strategyId_fkey" FOREIGN KEY ("strategyId") REFERENCES "Strategy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MapSessionInvestmentLine" ADD CONSTRAINT "MapSessionInvestmentLine_mapSessionId_fkey" FOREIGN KEY ("mapSessionId") REFERENCES "MapSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MapSessionRevenueLine" ADD CONSTRAINT "MapSessionRevenueLine_mapSessionId_fkey" FOREIGN KEY ("mapSessionId") REFERENCES "MapSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
