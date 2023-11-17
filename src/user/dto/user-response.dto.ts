import { Exclude } from 'class-transformer';
import { RoleEnum, User } from 'src/models/User';

export class UserResponse implements User {
  isActive: boolean;
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
  role: RoleEnum;
}
