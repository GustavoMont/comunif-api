import { PrismaClient } from '@prisma/client';
import channelTypes from './fixtures/channel-types';
import communities from './fixtures/communities';
import users from './fixtures/users';
import communitiesChannels from './fixtures/community-channels';
import resetPasswordsCode from './fixtures/reset-password-codes';
import communityHasUsers from './fixtures/community-has-users';
import userStatistics from './fixtures/user-statistics';
import communityStatistics from './fixtures/community-statistics';
import evasionReports from './fixtures/evasion-reports';

const db = new PrismaClient();

const main = async () => {
  for (const data of channelTypes) {
    delete data.id;
    await db.channelType.create({
      data,
    });
  }
  if (process.env.ENVIROMENT !== 'production') {
    for (const data of users) {
      delete data.id;
      await db.user.create({
        data,
      });
    }
    for (const data of communities) {
      delete data.id;
      await db.community.create({
        data,
      });
    }
    for (const data of communitiesChannels) {
      delete data.id;
      await db.communityChannel.create({
        data,
      });
    }
    for (const data of resetPasswordsCode) {
      delete data.id;
      await db.resetPasswordCode.create({
        data,
      });
    }
    for (const data of communityHasUsers) {
      delete data.id;
      await db.communityHasUsers.create({
        data,
      });
    }
    for (const data of userStatistics) {
      delete data.id;
      await db.userStatistics.create({
        data,
      });
    }
    for (const data of communityStatistics) {
      delete data.id;
      await db.communityStatistics.create({
        data,
      });
    }
    for (const data of evasionReports) {
      delete data.id;
      await db.evasionReport.create({
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
