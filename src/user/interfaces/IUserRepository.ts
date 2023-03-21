import { User } from '@prisma/client';

export interface IUserRepository {
  findAll(): Promise<User[]>;

  findById(id: number): Promise<User>;

  findByUsername(username: string): Promise<User>;

  findByEmail(email: string): Promise<User>;

  create(user: User);
}
