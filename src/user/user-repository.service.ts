import { Injectable } from '@nestjs/common';
import { PrismaClient, User } from '@prisma/client';

@Injectable()
export class UserRepository {
  constructor(private readonly db: PrismaClient) {}
  async findAll(): Promise<User[]> {
    return await this.db.user.findMany();
  }
  async findOne(username: string): Promise<User> {
    return await this.db.user.findUnique({
      where: {
        username,
      },
    });
  }
}
