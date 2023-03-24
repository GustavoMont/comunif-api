import { User } from '@prisma/client';
import { Exclude } from 'class-transformer';

export class UserUpdate implements User {
  @Exclude()
  id: number;
  name: string;
  lastName: string;
  @Exclude()
  email: string;
  username: string;
  @Exclude()
  password: string;
  birthday: Date;
  bio: string;
  avatar: string;
}
