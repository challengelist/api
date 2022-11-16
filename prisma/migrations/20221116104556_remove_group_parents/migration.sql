/*
  Warnings:

  - You are about to drop the column `parent_id` on the `groups` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "groups" DROP CONSTRAINT "groups_parent_id_fkey";

-- AlterTable
ALTER TABLE "groups" DROP COLUMN "parent_id";
