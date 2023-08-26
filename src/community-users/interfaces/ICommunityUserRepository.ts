import { PaginationDto } from 'src/dtos/pagination.dto';
import { Community } from 'src/models/Community';
import { User } from 'src/models/User';

export interface ICommunityUsersRepostory {
  findUser(communityId: number, userId: number): Promise<User>;
  addUser(communityId: number, userId: number): Promise<Community>;
  findCommunityMembers(
    communityId: number,
    pagination: PaginationDto,
  ): Promise<User[]>;
  countCommunityMembers(communityId: number): Promise<number>;
}

export const ICommunityUsersRepostory = Symbol('ICommunityUsersRepostory');
