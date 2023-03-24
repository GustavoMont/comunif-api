import { User } from '@prisma/client';

export const userGenerator = (change?: Partial<User>): User => ({
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
