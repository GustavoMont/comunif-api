import { PaginationDto } from 'src/dtos/pagination.dto';
import { Community } from 'src/models/Community';
import { User } from 'src/models/User';
import { CommunityUsersQueryDto } from '../dto/community-users-query.dto';
import { CommunityHasUsers } from '@prisma/client';

export interface ICommunityUsersRepostory {
  findUser(communityId: number, userId: number): Promise<CommunityHasUsers>;
  addUser(communityId: number, userId: number): Promise<Community>;
  findCommunityMembers(
    communityId: number,
    pagination: PaginationDto,
    filters?: CommunityUsersQueryDto,
  ): Promise<User[]>;
  countCommunityMembers(
    communityId: number,
    where?: CommunityUsersQueryDto,
  ): Promise<number>;
  delete(id: number): Promise<void>;
}

export const ICommunityUsersRepostory = Symbol('ICommunityUsersRepostory');
