-- AlterTable
ALTER TABLE "accounts" ADD COLUMN     "country_code" TEXT NOT NULL DEFAULT 'XX',
ADD COLUMN     "subdivision_code" TEXT NOT NULL DEFAULT 'XX-XX';
