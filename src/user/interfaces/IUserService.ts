import { User } from '@prisma/client';
import { UserResponse } from '../dto/user-response.dto';
import { UserUpdate } from '../dto/user-update.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';

export abstract class IUserService {
  abstract findById(id: number): Promise<UserResponse>;
  abstract findAll(): Promise<User[]>;
  abstract update(id: number, changes: UserUpdate): Promise<UserResponse>;
  abstract resetPassword(body: ResetPasswordDto): Promise<void>;
  abstract findByEmail(email: string): Promise<UserResponse>;
}
