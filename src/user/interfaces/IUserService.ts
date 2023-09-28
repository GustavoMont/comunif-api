import { UserResponse } from '../dto/user-response.dto';
import { UserUpdate } from '../dto/user-update.dto';
import { ListResponse } from 'src/dtos/list.dto';
import { PasswordDto } from '../dto/password.dto';
import { UserCreate } from '../dto/user-create.dto';
import { RequestUser } from 'src/types/RequestUser';

export interface IUserService {
  findById(id: number): Promise<UserResponse>;
  findAll(page?: number, take?: number): Promise<ListResponse<UserResponse>>;
  update(id: number, changes: UserUpdate): Promise<UserResponse>;
  findByEmail(email: string): Promise<UserResponse>;
  create(body: UserCreate, currentUser?: RequestUser): Promise<UserResponse>;
  changePassword(userId: number, update: PasswordDto): Promise<UserResponse>;
  emailExists(email: string): Promise<boolean>;
  usernameExists(username: string): Promise<boolean>;
  validateUser(username: string, password: string): Promise<UserResponse>;
}

export const IUserService = Symbol('IUserService');
