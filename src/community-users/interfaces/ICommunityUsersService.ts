import { CommunityResponse } from 'src/community/dto/community-response.dto';
import { ListResponse } from 'src/dtos/list.dto';
import { UserResponse } from 'src/user/dto/user-response.dto';

export interface ICommunityUsersService {
  addUser(communityId: number, userId: number): Promise<CommunityResponse>;
  findCommunityMembers(
    communityId: number,
    page: number,
    take: number,
  ): Promise<ListResponse<UserResponse>>;
}

export const ICommunityUsersService = Symbol('ICommunityUsersService');
