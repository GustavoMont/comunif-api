import { Injectable } from '@nestjs/common';
import { PrismaClient, User } from '@prisma/client';
import { UserUpdate } from './dto/user-update.dto';
import { IUserRepository } from './interfaces/IUserRepository';
import { PaginationDto } from 'src/dtos/pagination.dto';
import { UserQueryDto } from './dto/user-query.dto';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(private readonly db: PrismaClient) {}
  async count(where?: UserQueryDto): Promise<number> {
    return await this.db.user.count({
      where,
    });
  }
  async findAll(
    { skip, take }: PaginationDto,
    where?: UserQueryDto,
  ): Promise<User[]> {
    return await this.db.user.findMany({
      take,
      skip,
      where,
    });
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
