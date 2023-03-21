import { User } from '@prisma/client';

export default [
  {
    id: 1,
    name: 'User',
    lastName: 'Primeiro',
    email: 'email@email.com',
    username: 'user1',
    password: '$2b$10$V1yjE4B.m1oeZnxELGIoOO06Qqv/CIcsm5llsMP8/a84Op1oGoT/i',
    birthday: new Date('2000-06-27T00:00:00.000Z'),
  },
  {
    id: 2,
    name: 'Segundo',
    lastName: 'Usuario',
    email: 'email2@email.com',
    username: 'user2',
    password: '$2b$10$/6XanOMawWiDBwtuigl9JOnPEN0BfDa/Xrck28zHtAJrAY8ooPyWS',
    birthday: new Date('2000-06-27T00:00:00.000Z'),
  },
  {
    id: 3,
    name: 'Terceiro',
    lastName: 'Usuario',
    email: 'email3@email.com',
    username: 'user3',
    password: '$2b$10$xKPmgW6ttwFAFFB5g60ihu3wNpB2XVlIZpkXMvhAdKoazw5r/Bk0m',
    birthday: new Date('2000-06-27T00:00:00.000Z'),
  },
] as User[];