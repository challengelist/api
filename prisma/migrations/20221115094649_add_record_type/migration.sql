-- CreateEnum
CREATE TYPE "RecordType" AS ENUM ('VERIFICATION', 'COMPLETION');

-- AlterTable
ALTER TABLE "records" ADD COLUMN     "type" "RecordType" NOT NULL DEFAULT 'COMPLETION';
