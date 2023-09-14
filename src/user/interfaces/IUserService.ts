import { User } from '@prisma/client';
import { UserResponse } from '../dto/user-response.dto';
import { UserUpdate } from '../dto/user-update.dto';
import { PasswordDto } from 'src/auth/dto/password.dto';
import { ListResponse } from 'src/dtos/list.dto';

export interface IUserService {
  findById(id: number): Promise<UserResponse>;
  findAll(page?: number, take?: number): Promise<ListResponse<UserResponse>>;
  update(id: number, changes: UserUpdate): Promise<UserResponse>;
  findByEmail(email: string): Promise<UserResponse>;
  findByUsername(username: string, getPassword: boolean): Promise<UserResponse>;
  create(user: User): Promise<User>;
  changePassword(userId: number, update: PasswordDto): Promise<void>;
  emailExists(email: string): Promise<boolean>;
}

export const IUserService = Symbol('IUserService');
