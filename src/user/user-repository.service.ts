import { Injectable } from '@nestjs/common';
import { PrismaClient, User } from '@prisma/client';

@Injectable()
export class UserRepository {
  constructor(private readonly db: PrismaClient) {}
  async findAll(): Promise<User[]> {
    return await this.db.user.findMany();
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
}
