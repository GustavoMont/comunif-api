import { Community, User } from '@prisma/client';
import { CommunityQueryDto } from '../dto/community-query.dto';

export interface ICommunityRepository {
  addUser(communityId: number, userId: number): Promise<Community>;
  findUser(communityId: number, userId: number): Promise<User>;
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
}

export const ICommunityRepository = Symbol('ICommunityRepository');
