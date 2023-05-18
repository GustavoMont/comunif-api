import { Injectable } from '@nestjs/common';
import { PrismaClient, User } from '@prisma/client';
import { UserUpdate } from './dto/user-update.dto';
import { IUserRepository } from './interfaces/IUserRepository';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(private readonly db: PrismaClient) {}
  async findAll(): Promise<User[]> {
    return await this.db.user.findMany();
  }

  async findById(id: number): Promise<User> {
    return await this.db.user.findUnique({
      where: {
        id,
      },
    });
  }

  async findByUsername(username: string): Promise<User> {
    const user = await this.db.user.findUnique({
      where: {
        username,
      },
    });
    return user || null;
  }
  async findByEmail(email: string): Promise<User> {
    return await this.db.user.findUnique({
      where: {
        email,
      },
    });
  }

  async create(user: User) {
    return await this.db.user.create({
      data: user,
    });
  }
  async update(id: number, updates: Partial<UserUpdate>): Promise<User> {
    const user = await this.db.user.findUnique({
      where: { id },
    });
    if (!user) {
      return null;
    }
    const userUpdated = await this.db.user.update({
      data: {
        ...user,
        ...updates,
      },
      where: { id },
    });
    return userUpdated;
  }
}
