import { Injectable } from '@nestjs/common';
import { Community, PrismaClient, User } from '@prisma/client';
import { ICommunityRepository } from './interfaces/ICommunityRepository';
import { CommunityQueryDto } from './dto/community-query.dto';

@Injectable()
export class CommunityRepository implements ICommunityRepository {
  constructor(private readonly db: PrismaClient) {}
  async findUserCommunities(userId: number): Promise<Community[]> {
    return await this.db.community.findMany({
      where: {
        users: {
          some: { userId },
        },
      },
      include: {
        communityChannels: true,
      },
    });
  }
  async findById(id: number): Promise<Community> {
    return await this.db.community.findUnique({
      where: {
        id,
      },
      include: {
        communityChannels: true,
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
    return result?.user || null;
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
        communityChannels: true,
      },
    });
  }
  async findAll(
    filters: CommunityQueryDto,
    take = 20,
    skip = 0,
  ): Promise<Community[]> {
    return await this.db.community.findMany({
      where: {
        ...filters,
      },
      include: {
        communityChannels: true,
      },
      take,
      skip,
    });
  }
  async update(id: number, changes: Partial<Community>): Promise<Community> {
    return await this.db.community.update({
      where: { id },
      data: {
        ...changes,
      },
    });
  }
  async count(filters?: CommunityQueryDto): Promise<number> {
    return await this.db.community.count({
      where: filters,
    });
  }
}
