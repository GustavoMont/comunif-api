-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CommunityChannel" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "communityId" INTEGER NOT NULL,
    "channelTypeId" INTEGER NOT NULL,
    CONSTRAINT "CommunityChannel_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Community" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CommunityChannel_channelTypeId_fkey" FOREIGN KEY ("channelTypeId") REFERENCES "ChannelType" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_CommunityChannel" ("channelTypeId", "communityId", "id") SELECT "channelTypeId", "communityId", "id" FROM "CommunityChannel";
DROP TABLE "CommunityChannel";
ALTER TABLE "new_CommunityChannel" RENAME TO "CommunityChannel";
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "birthday" DATETIME NOT NULL,
    "bio" TEXT,
    "avatar" TEXT,
    "role" TEXT NOT NULL DEFAULT user
);
INSERT INTO "new_User" ("avatar", "bio", "birthday", "email", "id", "lastName", "name", "password", "role", "username") SELECT "avatar", "bio", "birthday", "email", "id", "lastName", "name", "password", "role", "username" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
CREATE TABLE "new_CommunityHasUsers" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "communityId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    CONSTRAINT "CommunityHasUsers_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Community" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CommunityHasUsers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_CommunityHasUsers" ("communityId", "id", "userId") SELECT "communityId", "id", "userId" FROM "CommunityHasUsers";
DROP TABLE "CommunityHasUsers";
ALTER TABLE "new_CommunityHasUsers" RENAME TO "CommunityHasUsers";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
