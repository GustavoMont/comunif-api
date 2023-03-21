import { User } from '@prisma/client';
import { UserResponse } from '../dto/user-response.dto';

export interface IUserService {
  findById(id: number): Promise<UserResponse>;
  findAll(): Promise<User[]>;
}
