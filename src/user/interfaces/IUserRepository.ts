import { User } from '@prisma/client';
import { PaginationDto } from 'src/dtos/pagination.dto';

export interface IUserRepository {
  count(): Promise<number>;
  findAll(filters?: PaginationDto): Promise<User[]>;
  findById(id: number): Promise<User>;
  findByUsername(username: string): Promise<User>;
  findByEmail(email: string): Promise<User>;
  create(user: User): Promise<User>;
  update(id: number, updates: Partial<User>): Promise<User>;
}

export const IUserRepository = Symbol('IUserRepository');
