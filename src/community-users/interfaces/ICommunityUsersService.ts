import { CommunityResponse } from 'src/community/dto/community-response.dto';
import { ListResponse } from 'src/dtos/list.dto';
import { RequestUser } from 'src/types/RequestUser';
import { UserResponse } from 'src/user/dto/user-response.dto';

export interface ICommunityUsersService {
  addUser(communityId: number, userId: number): Promise<CommunityResponse>;
  findCommunityMembers(
    communityId: number,
    page: number,
    take: number,
  ): Promise<ListResponse<UserResponse>>;
  isUserInCommunity(userId: number, communityId: number): Promise<boolean>;
  leaveCommunity(
    communityId: number,
    userId: number,
    user: RequestUser,
  ): Promise<void>;
}

export const ICommunityUsersService = Symbol('ICommunityUsersService');
