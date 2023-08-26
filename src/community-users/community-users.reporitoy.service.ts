import { Injectable } from '@nestjs/common';
import { ICommunityUsersRepostory } from './interfaces/ICommunityUserRepository';
import { PrismaClient } from '@prisma/client';
import { User } from 'src/models/User';
import { Community } from 'src/models/Community';

@Injectable()
export class CommunityUsersRepository implements ICommunityUsersRepostory {
  constructor(private readonly db: PrismaClient) {}
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
    return (result?.user as User) || null;
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
      include: {
        communityChannels: {
          include: {
            channelType: true,
          },
        },
      },
    });
  }
}
