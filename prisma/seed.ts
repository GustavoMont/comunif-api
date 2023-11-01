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
    for (const data of resetPasswordsCode) {
      await db.resetPasswordCode.create({
        data,
      });
    }
    for (const data of communityHasUsers) {
      await db.communityHasUsers.create({
        data,
      });
    }
    for (const data of userStatistics) {
      await db.userStatistics.create({
        data,
      });
    }
    for (const data of communityStatistics) {
      await db.communityStatistics.create({
        data,
      });
    }
    for (const data of evasionReports) {
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
