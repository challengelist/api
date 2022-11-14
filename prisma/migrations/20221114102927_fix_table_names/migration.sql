/*
  Warnings:

  - You are about to drop the `Integration` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Session` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `challenge` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Session" DROP CONSTRAINT "Session_account_id_fkey";

-- DropForeignKey
ALTER TABLE "_completed_challenges" DROP CONSTRAINT "_completed_challenges_A_fkey";

-- DropForeignKey
ALTER TABLE "_created_challenges" DROP CONSTRAINT "_created_challenges_A_fkey";

-- DropForeignKey
ALTER TABLE "challenge" DROP CONSTRAINT "challenge_publisher_id_fkey";

-- DropForeignKey
ALTER TABLE "challenge" DROP CONSTRAINT "challenge_verifier_id_fkey";

-- DropTable
DROP TABLE "Integration";

-- DropTable
DROP TABLE "Session";

-- DropTable
DROP TABLE "challenge";

-- CreateTable
CREATE TABLE "sessions" (
    "id" SERIAL NOT NULL,
    "account_id" INTEGER NOT NULL,
    "session_token" TEXT NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "challenges" (
    "id" SERIAL NOT NULL,
    "verifier_id" INTEGER NOT NULL,
    "publisher_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "level_id" INTEGER,
    "fps" TEXT,
    "status" "ChallengeStatus" NOT NULL DEFAULT 'VISIBLE',
    "points_worth" INTEGER,

    CONSTRAINT "challenges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "integrations" (
    "id" SERIAL NOT NULL,
    "type" "IntegrationType" NOT NULL,
    "account_id" INTEGER NOT NULL,
    "access_token" TEXT NOT NULL,
    "refresh_token" TEXT,
    "token_type" TEXT,
    "expires_in" INTEGER,

    CONSTRAINT "integrations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sessions_session_token_key" ON "sessions"("session_token");

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "challenges" ADD CONSTRAINT "challenges_verifier_id_fkey" FOREIGN KEY ("verifier_id") REFERENCES "players"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "challenges" ADD CONSTRAINT "challenges_publisher_id_fkey" FOREIGN KEY ("publisher_id") REFERENCES "players"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_created_challenges" ADD CONSTRAINT "_created_challenges_A_fkey" FOREIGN KEY ("A") REFERENCES "challenges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_completed_challenges" ADD CONSTRAINT "_completed_challenges_A_fkey" FOREIGN KEY ("A") REFERENCES "challenges"("id") ON DELETE CASCADE ON UPDATE CASCADE;
