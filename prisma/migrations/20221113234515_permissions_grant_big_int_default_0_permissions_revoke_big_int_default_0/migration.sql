-- AlterTable
ALTER TABLE "accounts" ADD COLUMN     "permissions_grant" BIGINT NOT NULL DEFAULT 0,
ADD COLUMN     "permissions_revoke" BIGINT NOT NULL DEFAULT 0;
