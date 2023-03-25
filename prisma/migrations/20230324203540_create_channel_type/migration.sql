-- CreateTable
CREATE TABLE "ChannelType" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "ChannelType_name_key" ON "ChannelType"("name");
