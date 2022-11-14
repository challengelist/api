-- CreateEnum
CREATE TYPE "BadgeObtainType" AS ENUM ('POINTS', 'POSITION', 'SPECIAL');

-- CreateTable
CREATE TABLE "accounts" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "groups" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "short_name" TEXT NOT NULL,
    "priority" INTEGER NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#FFFFFF',
    "background_color" TEXT NOT NULL DEFAULT '#000000',
    "icon" TEXT,
    "permissions_grant" BIGINT NOT NULL DEFAULT 0,
    "permissions_revoke" BIGINT NOT NULL DEFAULT 0,

    CONSTRAINT "groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "players" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "banned" BOOLEAN NOT NULL DEFAULT false,
    "account_id" INTEGER,

    CONSTRAINT "players_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "badges" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "obtain_type" "BadgeObtainType" NOT NULL,

    CONSTRAINT "badges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "challenge" (
    "id" SERIAL NOT NULL,
    "verifier_id" INTEGER NOT NULL,
    "publisher_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "challenge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_AccountToGroup" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_AccountToBadge" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_created_challenges" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_completed_challenges" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "accounts_name_key" ON "accounts"("name");

-- CreateIndex
CREATE UNIQUE INDEX "players_account_id_key" ON "players"("account_id");

-- CreateIndex
CREATE UNIQUE INDEX "_AccountToGroup_AB_unique" ON "_AccountToGroup"("A", "B");

-- CreateIndex
CREATE INDEX "_AccountToGroup_B_index" ON "_AccountToGroup"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_AccountToBadge_AB_unique" ON "_AccountToBadge"("A", "B");

-- CreateIndex
CREATE INDEX "_AccountToBadge_B_index" ON "_AccountToBadge"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_created_challenges_AB_unique" ON "_created_challenges"("A", "B");

-- CreateIndex
CREATE INDEX "_created_challenges_B_index" ON "_created_challenges"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_completed_challenges_AB_unique" ON "_completed_challenges"("A", "B");

-- CreateIndex
CREATE INDEX "_completed_challenges_B_index" ON "_completed_challenges"("B");

-- AddForeignKey
ALTER TABLE "players" ADD CONSTRAINT "players_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "challenge" ADD CONSTRAINT "challenge_verifier_id_fkey" FOREIGN KEY ("verifier_id") REFERENCES "players"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "challenge" ADD CONSTRAINT "challenge_publisher_id_fkey" FOREIGN KEY ("publisher_id") REFERENCES "players"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AccountToGroup" ADD CONSTRAINT "_AccountToGroup_A_fkey" FOREIGN KEY ("A") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AccountToGroup" ADD CONSTRAINT "_AccountToGroup_B_fkey" FOREIGN KEY ("B") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AccountToBadge" ADD CONSTRAINT "_AccountToBadge_A_fkey" FOREIGN KEY ("A") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AccountToBadge" ADD CONSTRAINT "_AccountToBadge_B_fkey" FOREIGN KEY ("B") REFERENCES "badges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_created_challenges" ADD CONSTRAINT "_created_challenges_A_fkey" FOREIGN KEY ("A") REFERENCES "challenge"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_created_challenges" ADD CONSTRAINT "_created_challenges_B_fkey" FOREIGN KEY ("B") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_completed_challenges" ADD CONSTRAINT "_completed_challenges_A_fkey" FOREIGN KEY ("A") REFERENCES "challenge"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_completed_challenges" ADD CONSTRAINT "_completed_challenges_B_fkey" FOREIGN KEY ("B") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE;
