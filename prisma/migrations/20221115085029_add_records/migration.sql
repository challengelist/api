-- CreateEnum
CREATE TYPE "RecordStatus" AS ENUM ('APPROVED', 'REJECTED', 'UNDER_CONSIDERATION', 'SUBMITTED');

-- AlterTable
ALTER TABLE "accounts" ADD COLUMN     "flags" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "records" (
    "id" SERIAL NOT NULL,
    "video" TEXT NOT NULL,
    "status" "RecordStatus" NOT NULL DEFAULT 'SUBMITTED',
    "player_id" INTEGER NOT NULL,
    "submitter_id" INTEGER,

    CONSTRAINT "records_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "records" ADD CONSTRAINT "records_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "records" ADD CONSTRAINT "records_submitter_id_fkey" FOREIGN KEY ("submitter_id") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
