import { User } from '@prisma/client';
import { PaginationDto } from 'src/dtos/pagination.dto';
import { UserQueryDto } from '../dto/user-query.dto';

export interface IUserRepository {
  count(query?: UserQueryDto): Promise<number>;
  findAll(filters?: PaginationDto, query?: UserQueryDto): Promise<User[]>;
  findById(id: number): Promise<User>;
  findByUsername(username: string): Promise<User>;
  findByEmail(email: string): Promise<User>;
  create(user: User): Promise<User>;
  update(id: number, updates: Partial<User>): Promise<User>;
}

export const IUserRepository = Symbol('IUserRepository');
