import { Injectable } from '@nestjs/common';
import { IAuthRepository } from './interfaces/IAuthRepository';
import { PrismaClient, UserTokens } from '@prisma/client';
import { CreateUpdateToken } from './dto/create-update-token.dto';

@Injectable()
export class AuthRepository implements IAuthRepository {
  constructor(private readonly db: PrismaClient) {}

  async findByUserId(userId: number): Promise<UserTokens> {
    const userToken = await this.db.userTokens.findUnique({
      where: {
        userId,
      },
      include: {
        user: true,
      },
    });
    return userToken;
  }
  async update(id: number, data: CreateUpdateToken): Promise<UserTokens> {
    return await this.db.userTokens.update({
      data,
      where: { id },
    });
  }
  async create(data: CreateUpdateToken): Promise<UserTokens> {
    return await this.db.userTokens.create({
      data,
    });
  }
}
