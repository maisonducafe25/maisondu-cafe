-- CreateTable
CREATE TABLE "public"."TestMe" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "TestMe_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TestMe_id_key" ON "public"."TestMe"("id");
