import { Community } from '@prisma/client';
import { CommunityQueryDto } from '../dto/community-query.dto';
import { User } from 'src/models/User';

export interface ICommunityRepository {
  findById(id: number): Promise<Community>;
  findUserCommunities(userId: number): Promise<Community[]>;
  findAll(
    filters?: CommunityQueryDto,
    take?: number,
    skip?: number,
  ): Promise<Community[]>;
  update(id: number, changes: Partial<Community>): Promise<Community>;
  count(filters?: CommunityQueryDto): Promise<number>;
  create(newCommunity: Community): Promise<Community>;
  delete(id: number): Promise<void>;
  findUser(communityId: number, userId: number): Promise<User>;
  findByChannelId(communityChannelId: number): Promise<Community>;
}

export const ICommunityRepository = Symbol('ICommunityRepository');
