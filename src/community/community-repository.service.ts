import { Injectable } from '@nestjs/common';
import { Community, PrismaClient } from '@prisma/client';
import { ICommunityRepository } from './interfaces/ICommunityRepository';
import { CommunityQueryDto } from './dto/community-query.dto';
import { User } from 'src/models/User';

@Injectable()
export class CommunityRepository implements ICommunityRepository {
  constructor(private readonly db: PrismaClient) {}
  async findByChannelId(communityChannelId: number): Promise<Community> {
    const communityChannel = await this.db.communityChannel.findUnique({
      where: { id: communityChannelId },
      include: {
        community: {
          include: {
            communityChannels: {
              include: {
                channelType: true,
              },
            },
          },
        },
      },
    });

    return communityChannel?.community;
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
  async delete(id: number): Promise<void> {
    await this.db.community.delete({
      where: {
        id,
      },
    });
  }
  async create(newCommunity: Community): Promise<Community> {
    const communty = await this.db.community.create({
      data: newCommunity,
    });
    const channelsTypes = await this.db.channelType.findMany();
    await Promise.all(
      channelsTypes.map(({ id }) =>
        this.db.communityChannel.create({
          data: {
            channelTypeId: id,
            communityId: communty.id,
          },
        }),
      ),
    );

    return communty;
  }
  async findUserCommunities(userId: number): Promise<Community[]> {
    return await this.db.community.findMany({
      where: {
        users: {
          some: { userId },
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
  async findById(id: number): Promise<Community> {
    return await this.db.community.findUnique({
      where: {
        id,
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
        communityChannels: {
          include: {
            channelType: true,
          },
        },
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
