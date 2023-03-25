import { Community, User } from '@prisma/client';

type generator<T> = (change?: Partial<T>) => T;

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
  ...change,
});

export const communityGenerator: generator<Community> = (change) => ({
  id: 1,
  name: 'comunidade',
  subjectId: 1,
  ...change,
});
