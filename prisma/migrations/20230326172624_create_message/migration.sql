-- CreateTable
CREATE TABLE "Message" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "content" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "communityChannelId" INTEGER NOT NULL,
    CONSTRAINT "Message_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Message_communityChannelId_fkey" FOREIGN KEY ("communityChannelId") REFERENCES "CommunityChannel" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CommunityChannel" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "communityId" INTEGER NOT NULL,
    "channelTypeId" INTEGER NOT NULL,
    CONSTRAINT "CommunityChannel_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Community" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CommunityChannel_channelTypeId_fkey" FOREIGN KEY ("channelTypeId") REFERENCES "ChannelType" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
