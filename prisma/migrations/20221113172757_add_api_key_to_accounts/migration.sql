/*
  Warnings:

  - A unique constraint covering the columns `[api_key]` on the table `accounts` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "accounts" ADD COLUMN     "api_key" TEXT;

-- CreateTable
CREATE TABLE "Session" (
    "id" SERIAL NOT NULL,
    "account_id" INTEGER NOT NULL,
    "session_token" TEXT NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Session_session_token_key" ON "Session"("session_token");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_api_key_key" ON "accounts"("api_key");
