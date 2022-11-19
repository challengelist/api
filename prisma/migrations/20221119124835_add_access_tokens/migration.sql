-- CreateTable
CREATE TABLE "access_codes" (
    "id" SERIAL NOT NULL,
    "discord_id" TEXT NOT NULL,
    "access_token" TEXT NOT NULL,

    CONSTRAINT "access_codes_pkey" PRIMARY KEY ("id")
);
