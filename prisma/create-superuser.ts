import { PrismaClient, User } from '@prisma/client';
import { hashSync } from 'bcrypt';
import * as prompt from 'prompt-sync';
import { RoleEnum } from '../src/models/User';

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
  .findMany({
    where: {
      role: 'admin',
    },
  })
  .then((user) => {
    if (user && !user.length) {
      db.user
        .create({
          data: {
            ...superUser,
            birthday: new Date(),
            password: hashSync(superUser.password, 10),
            role: RoleEnum.admin,
          },
        })
        .then(() => console.log('SUCESSO'))
        .catch((err) => console.error(err));
    } else {
      throw new Error('VOCÊ NÃO PODE ADICIONAR UM ADMIN');
    }
  })
  .catch((err) => {
    console.error(err.message);
  });
