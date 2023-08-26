import { Injectable } from '@nestjs/common';
import { ICommunityUsersRepostory } from './interfaces/ICommunityUserRepository';
import { PrismaClient } from '@prisma/client';
import { User } from 'src/models/User';
import { Community } from 'src/models/Community';
import { PaginationDto } from 'src/dtos/pagination.dto';

@Injectable()
export class CommunityUsersRepository implements ICommunityUsersRepostory {
  constructor(private readonly db: PrismaClient) {}
  async findCommunityMembers(
    communityId: number,
    { skip = 0, take = 20 }: PaginationDto,
  ): Promise<User[]> {
    const communityHasUsers = await this.db.communityHasUsers.findMany({
      skip,
      take,
      where: { communityId },
      include: {
        user: true,
      },
      orderBy: {
        user: {
          name: 'asc',
        },
      },
    });
    const members = communityHasUsers.map(({ user }) => user);
    return members as User[];
  }
  async countCommunityMembers(communityId: number): Promise<number> {
    return await this.db.communityHasUsers.count({
      where: {
        communityId,
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
