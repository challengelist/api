-- CreateEnum
CREATE TYPE "IntegrationType" AS ENUM ('DISCORD', 'GEOMETRY_DASH');

-- CreateTable
CREATE TABLE "Integration" (
    "id" SERIAL NOT NULL,
    "type" "IntegrationType" NOT NULL,
    "account_id" INTEGER NOT NULL,
    "access_token" TEXT NOT NULL,
    "refresh_token" TEXT,
    "token_type" TEXT,
    "expires_in" INTEGER,

    CONSTRAINT "Integration_pkey" PRIMARY KEY ("id")
);
