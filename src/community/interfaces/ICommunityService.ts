import { CommunityResponse } from '../dto/community-response.dto';
import { CommunityUpdate } from '../dto/community-update.dto';

export interface ICommunityService {
  addUser(userId: number, communityId: number): Promise<CommunityResponse>;
  findById(id: number): Promise<CommunityResponse>;
  findUserCommunities(userId: number): Promise<CommunityResponse[]>;
  findAll(isAdmin: boolean): Promise<CommunityResponse[]>;
  update(id: number, changes: CommunityUpdate): Promise<CommunityResponse>;
}
