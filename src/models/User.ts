import { User as UserType } from '@prisma/client';

export enum RoleEnum {
  user = 'user',
  admin = 'admin',
}

export class User implements UserType {
  id: number;
  name: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
  birthday: Date;
  bio: string;
  avatar: string;
  role: RoleEnum;
}
