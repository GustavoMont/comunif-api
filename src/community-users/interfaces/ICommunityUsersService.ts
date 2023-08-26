import { CommunityResponse } from 'src/community/dto/community-response.dto';

export interface ICommunityUsersService {
  addUser(communityId: number, userId: number): Promise<CommunityResponse>;
}

export const ICommunityUsersService = Symbol('ICommunityUsersService');
