import { PrismaClient } from '@prisma/client';
import users from './fixtures/users';

const db = new PrismaClient();

const main = async () => {
  for (const data of users) {
    await db.user.create({
      data,
    });
  }
};

main()
  .catch((err) => console.error(err))
  .finally(() => {
    db.$disconnect();
  });
