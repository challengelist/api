/*
  Warnings:

  - You are about to alter the column `permissions_grant` on the `accounts` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to alter the column `permissions_revoke` on the `accounts` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to alter the column `permissions_grant` on the `groups` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to alter the column `permissions_revoke` on the `groups` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.

*/
-- AlterTable
ALTER TABLE "accounts" ALTER COLUMN "permissions_grant" SET DATA TYPE INTEGER,
ALTER COLUMN "permissions_revoke" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "groups" ALTER COLUMN "permissions_grant" SET DATA TYPE INTEGER,
ALTER COLUMN "permissions_revoke" SET DATA TYPE INTEGER;
