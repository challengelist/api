/*
  Warnings:

  - You are about to drop the `_completed_challenges` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `challenge_id` to the `records` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_completed_challenges" DROP CONSTRAINT "_completed_challenges_A_fkey";

-- DropForeignKey
ALTER TABLE "_completed_challenges" DROP CONSTRAINT "_completed_challenges_B_fkey";

-- AlterTable
ALTER TABLE "records" ADD COLUMN     "challenge_id" INTEGER NOT NULL;

-- DropTable
DROP TABLE "_completed_challenges";

-- AddForeignKey
ALTER TABLE "records" ADD CONSTRAINT "records_challenge_id_fkey" FOREIGN KEY ("challenge_id") REFERENCES "challenges"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
