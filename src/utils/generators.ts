import { CommunityChannel } from '@prisma/client';
import { Community } from 'src/models/Community';
import { RoleEnum, User } from 'src/models/User';

type generator<T> = (change?: Partial<T>) => T;

export const arrayGenerator = <T>(length: number, generator: generator<T>) => {
  const array = Array.from({ length }, (value, key) =>
    generator({ id: key } as any),
  );
  return array;
};

export const userGenerator: generator<User> = (change) => ({
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
  ...change,
});

const communityChannelGenerator: generator<CommunityChannel> = (changes) => ({
  id: 1,
  channelTypeId: 1,
  communityId: 1,
  ...changes,
});

export const communityGenerator: generator<Community> = (change) => ({
  id: 1,
  name: 'comunidade',
  subjectId: 1,
  communityChannels: arrayGenerator<CommunityChannel>(
    3,
    communityChannelGenerator,
  ),
  ...change,
});
