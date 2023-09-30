import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { RoleEnum } from '../../src/models/User';

export default [
  {
    id: 1,
    name: 'Admin',
    avatar: null,
    bio: null,
    birthday: new Date('2000-06-27T00:00:00.000Z'),
    email: 'admin@admin.com',
    lastName: 'Souza',
    password: bcrypt.hashSync('4dminSenha', 10),
    role: RoleEnum.admin,
    username: 'admin',
    isActive: true,
  },
  {
    id: 2,
    name: 'User',
    lastName: 'Primeiro',
    email: 'email@email.com',
    username: 'user1',
    password: bcrypt.hashSync('12345678S', 10),
    birthday: new Date('2000-06-27T00:00:00.000Z'),
    avatar: null,
    bio: null,
    role: RoleEnum.user,
    isActive: true,
  },
  {
    id: 3,
    name: 'Segundo',
    lastName: 'Usuario',
    email: 'email2@email.com',
    username: 'user2',
    password: bcrypt.hashSync('12345678S', 10),
    birthday: new Date('2000-06-27T00:00:00.000Z'),
    avatar: null,
    bio: null,
    role: RoleEnum.user,
    isActive: true,
  },
  {
    id: 4,
    name: 'Terceiro',
    lastName: 'Usuario',
    email: 'email3@email.com',
    username: 'user3',
    password: bcrypt.hashSync('12345678S', 10),
    birthday: new Date('2000-06-27T00:00:00.000Z'),
    avatar: null,
    bio: null,
    role: RoleEnum.user,
    isActive: true,
  },
  {
    id: 5,
    name: 'Editável',
    lastName: 'Usuario',
    email: 'editavel@editavel.com',
    username: 'editavel',
    password: bcrypt.hashSync('12345678S', 10),
    birthday: new Date('2000-06-27T00:00:00.000Z'),
    avatar: null,
    bio: null,
    role: RoleEnum.user,
    isActive: true,
  },
  {
    id: 6,
    name: 'Comunite',
    lastName: 'Test',
    email: 'comunity@test.com',
    username: 'community',
    password: bcrypt.hashSync('12345678S', 10),
    birthday: new Date('2000-06-27T00:00:00.000Z'),
    avatar: null,
    bio: null,
    role: RoleEnum.user,
    isActive: true,
  },
  {
    id: 7,
    name: 'Passwordson',
    lastName: 'Usuario',
    email: 'password@password.com',
    username: 'password',
    password: bcrypt.hashSync('12345678S', 10),
    birthday: new Date('2000-06-27T00:00:00.000Z'),
    avatar: null,
    bio: null,
    role: RoleEnum.user,
    isActive: true,
  },
  {
    id: 8,
    name: 'Ativado',
    lastName: 'Usuario',
    email: 'ativado@ativado.com',
    username: 'ativado',
    password: bcrypt.hashSync('12345678S', 10),
    birthday: new Date('2000-06-27T00:00:00.000Z'),
    avatar: null,
    bio: null,
    role: RoleEnum.user,
    isActive: true,
  },
  {
    id: 9,
    name: 'Desativado',
    lastName: 'Usuario',
    email: 'desativado@ativado.com',
    username: 'desativado',
    password: bcrypt.hashSync('12345678S', 10),
    birthday: new Date('2000-06-27T00:00:00.000Z'),
    avatar: null,
    bio: null,
    role: RoleEnum.user,
    isActive: false,
  },
] as User[];
