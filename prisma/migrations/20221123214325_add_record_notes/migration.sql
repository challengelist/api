-- CreateTable
CREATE TABLE "record_notes" (
    "id" SERIAL NOT NULL,
    "author_id" INTEGER NOT NULL,
    "editor_ids" INTEGER[],

    CONSTRAINT "record_notes_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "record_notes" ADD CONSTRAINT "record_notes_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
