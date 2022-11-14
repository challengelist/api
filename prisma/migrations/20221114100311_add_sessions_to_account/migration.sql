-- AlterTable
ALTER TABLE "challenge" ADD COLUMN     "points_worth" INTEGER,
ALTER COLUMN "fps" SET DATA TYPE TEXT;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
