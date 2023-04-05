import { CommunityResponse } from '../dto/community-response.dto';

export interface ICommunityService {
  addUser(userId: number, communityId: number): Promise<CommunityResponse>;
  findById(id: number): Promise<CommunityResponse>;
  findUserCommunities(userId: number): Promise<CommunityResponse[]>;
}
