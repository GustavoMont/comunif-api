import { User } from '@prisma/client';
import { UserUpdate } from '../dto/user-update.dto';

export interface IUserRepository {
  findAll(): Promise<User[]>;

  findById(id: number): Promise<User>;

  findByUsername(username: string): Promise<User>;

  findByEmail(email: string): Promise<User>;

  create(user: User);

  update(id: number, updates: UserUpdate): Promise<User>;
}
