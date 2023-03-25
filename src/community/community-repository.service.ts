import { Injectable } from '@nestjs/common';
import { Community, PrismaClient, User } from '@prisma/client';
import { ICommunityRepository } from './interfaces/ICommunityRepository';

@Injectable()
export class CommunityRepository implements ICommunityRepository {
  constructor(private readonly db: PrismaClient) {}
  async findById(id: number): Promise<Community> {
    return await this.db.community.findUnique({
      where: {
        id,
      },
    });
  }
  async findUser(communityId: number, userId: number): Promise<User> {
    const result = await this.db.communityHasUsers.findFirst({
      where: {
        communityId,
        userId,
      },
      include: {
        user: true,
      },
    });
    return result ? result.user : null;
  }
  async addUser(communityId: number, userId: number): Promise<Community> {
    return await this.db.community.update({
      where: {
        id: communityId,
      },
      data: {
        users: {
          create: [
            {
              user: {
                connect: { id: userId },
              },
            },
          ],
        },
      },
    });
  }
}
