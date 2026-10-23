-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('CHAOS', 'DIVINE');

-- AlterTable
ALTER TABLE "StrategyEnhancementLine"
ADD COLUMN     "currency" "Currency" NOT NULL DEFAULT 'CHAOS',
ADD COLUMN     "userCostInput" DECIMAL(20,8) NOT NULL DEFAULT 0;


UPDATE "StrategyEnhancementLine" SET "currency" = 'CHAOS',
"userCostInput" = "unitCostChaos";

ALTER TABLE "Strategy" ADD COLUMN     "divineRateChaos" DECIMAL(20,8);