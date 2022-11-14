-- CreateEnum
CREATE TYPE "ChallengeStatus" AS ENUM ('HIDDEN', 'REMOVED', 'VISIBLE');

-- AlterTable
ALTER TABLE "challenge" ADD COLUMN     "fps" INTEGER,
ADD COLUMN     "level_id" INTEGER,
ADD COLUMN     "status" "ChallengeStatus" NOT NULL DEFAULT 'VISIBLE';
