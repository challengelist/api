/*
  Warnings:

  - You are about to drop the column `name` on the `accounts` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[username]` on the table `accounts` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `username` to the `accounts` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "accounts_name_key";

-- AlterTable
ALTER TABLE "accounts" DROP COLUMN "name",
ADD COLUMN     "username" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "accounts_username_key" ON "accounts"("username");
