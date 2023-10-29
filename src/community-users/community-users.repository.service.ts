import { Injectable } from '@nestjs/common';
import { ICommunityUsersRepostory } from './interfaces/ICommunityUserRepository';
import { CommunityHasUsers, PrismaClient } from '@prisma/client';
import { User } from 'src/models/User';
import { Community } from 'src/models/Community';
import { PaginationDto } from 'src/dtos/pagination.dto';
import { CommunityUsersQueryDto } from './dto/community-users-query.dto';

@Injectable()
export class CommunityUsersRepository implements ICommunityUsersRepostory {
  constructor(private readonly db: PrismaClient) {}
  async delete(id: number): Promise<void> {
    await this.db.communityHasUsers.delete({ where: { id } });
  }
  async findCommunityMembers(
    communityId: number,
    { skip = 0, take = 20 }: PaginationDto,
    where?: CommunityUsersQueryDto,
  ): Promise<User[]> {
    const communityHasUsers = await this.db.communityHasUsers.findMany({
      skip,
      take,
      where: { communityId, ...where },
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
  async countCommunityMembers(
    communityId: number,
    where?: CommunityUsersQueryDto,
  ): Promise<number> {
    return await this.db.communityHasUsers.count({
      where: {
        communityId,
        ...where,
      },
    });
  }
  async findUser(
    communityId: number,
    userId: number,
  ): Promise<CommunityHasUsers> {
    return await this.db.communityHasUsers.findFirst({
      where: {
        communityId,
        userId,
      },
    });
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
