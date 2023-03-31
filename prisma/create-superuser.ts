import { PrismaClient, User } from '@prisma/client';
import { hashSync } from 'bcrypt';
import * as prompt from 'prompt-sync';

const question = prompt();

const superUser = {
  name: '',
  email: '',
  password: '',
  username: '',
  lastName: '',
} as User;

Object.keys(superUser).forEach((key) => {
  superUser[key] = question(`${key}: `);
});

const db = new PrismaClient();

db.user
  .create({
    data: {
      ...superUser,
      birthday: new Date(),
      password: hashSync(superUser.password, 10),
    },
  })
  .then(() => console.log('SUCESSO'))
  .catch((err) => console.error(err));
