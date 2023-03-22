import { User } from '@prisma/client';
import { UserResponse } from '../dto/user-response.dto';
import { UserUpdate } from '../dto/user-update.dto';

export interface IUserService {
  findById(id: number): Promise<UserResponse>;

  findAll(): Promise<User[]>;

  update(id: number, changes: UserUpdate): Promise<UserResponse>;
}
