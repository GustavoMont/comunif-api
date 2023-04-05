import { PrismaClient } from '@prisma/client';
import channelTypes from './fixtures/channel-types';
import communities from './fixtures/communities';
import subjects from './fixtures/subjects';
import users from './fixtures/users';
import communitiesChannels from './fixtures/community-channels';

const db = new PrismaClient();

const main = async () => {
  for (const data of channelTypes) {
    await db.channelType.create({
      data,
    });
  }
  if (process.env.ENVIROMENT === 'development') {
    for (const data of users) {
      await db.user.create({
        data,
      });
    }
    for (const data of subjects) {
      await db.subject.create({
        data,
      });
    }
    for (const data of communities) {
      await db.community.create({
        data,
      });
    }
    for (const data of communitiesChannels) {
      await db.communityChannel.create({
        data,
      });
    }
  }
};

main()
  .catch((err) => console.error(err))
  .finally(() => {
    db.$disconnect();
  });
