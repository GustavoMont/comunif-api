import { User } from '@prisma/client';
import { Exclude } from 'class-transformer';

export class UserResponse implements User {
  id: number;
  name: string;
  lastName: string;
  email: string;
  username: string;
  @Exclude()
  password: string;
  @Exclude()
  birthday: Date;
  bio: string;
  avatar: string;
}
