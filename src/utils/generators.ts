import {
  CommunityChannel,
  CommunityHasUsers,
  ResetPasswordCode,
  UserTokens,
} from '@prisma/client';
import * as moment from 'moment';
import { Community } from 'src/models/Community';
import { CommunityStatistics } from 'src/models/CommunityStatistics';
import { EvasionReport } from 'src/models/EvasionReport';
import { Message } from 'src/models/Message';
import { MessageStatistics } from 'src/models/MessageStatistics';
import { RoleEnum, User } from 'src/models/User';
import { UserStatistics } from 'src/models/UserStatistics';
import { RequestUser } from 'src/types/RequestUser';
import { v4 } from 'uuid';

type Generator<T> = (change?: Partial<T>) => T;

export const arrayGenerator = <T>(length: number, generator: Generator<T>) => {
  const array = Array.from({ length }, (value, key) =>
    generator({ id: key } as any),
  );
  return array;
};

export const resetPasswordCodeGenerator: Generator<ResetPasswordCode> = (
  resetPasswordCode,
) => ({
  code: '0001',
  expiresAt: new Date('01-01-2001'),
  id: 1,
  userId: 1,
  ...resetPasswordCode,
});

export const userGenerator: Generator<User> = (change) => ({
  birthday: new Date('11-11-00'),
  email: 'email@email.com',
  id: 1,
  lastName: 'Last',
  name: 'Name',
  password: 'password',
  username: 'username',
  avatar: null,
  bio: null,
  role: RoleEnum.user,
  isActive: true,
  ...change,
});

export const requestUserGenerator: Generator<RequestUser> = (user) => ({
  id: 1,
  roles: [RoleEnum.user],
  username: 'username',
  ...user,
});

const communityChannelGenerator: Generator<CommunityChannel> = (changes) => ({
  id: 1,
  channelTypeId: 1,
  communityId: 1,
  ...changes,
});

export const communityGenerator: Generator<Community> = (change) => ({
  id: 1,
  name: 'comunidade',
  subject: 'subject',
  communityChannels: arrayGenerator<CommunityChannel>(
    3,
    communityChannelGenerator,
  ),
  banner: 'banner',
  isActive: true,
  adminId: 1,
  ...change,
});

export const userTokenGenerator: Generator<UserTokens> = (userToken) => ({
  expiresIn: moment().toDate(),
  id: 1,
  token: v4(),
  userId: 1,
  ...userToken,
});

export const messageGenerator: Generator<Message> = (message) => ({
  communityChannelId: 1,
  content: 'content',
  id: 1,
  user: userGenerator(),
  userId: 1,
  createdAt: new Date(),
  ...message,
});

export const userStatisticsGenerator: Generator<UserStatistics> = (
  userStatistics,
) => ({
  count: 10,
  createdAt: moment().toDate(),
  id: 1,
  user: userGenerator(),
  userId: 1,
  ...userStatistics,
});

export const communityStatisticsGenerator: Generator<CommunityStatistics> = (
  communityStatistics,
) => ({
  count: 10,
  createdAt: moment().toDate(),
  id: 1,
  user: userGenerator(),
  userId: 1,
  ...communityStatistics,
});

export const evasionReportGenerator: Generator<EvasionReport> = (
  evasionReport,
) => ({
  community: communityGenerator(),
  communityId: 1,
  id: 1,
  reason: 'blablabla',
  removedAt: moment().toDate(),
  remover: userGenerator({ role: RoleEnum.admin }),
  removerId: 1,
  user: userGenerator({ id: 2 }),
  userId: 2,
  ...evasionReport,
});

export const communityHasUserGenerator: Generator<CommunityHasUsers> = (
  chs,
) => ({
  communityId: 1,
  id: 1,
  userId: 1,
  ...chs,
});

export const messageStatisticsGenerator: Generator<MessageStatistics> = (
  ms,
) => ({
  count: 10,
  createdAt: moment().toDate(),
  id: 1,
  user: userGenerator(),
  userId: 1,
  ...ms,
});
