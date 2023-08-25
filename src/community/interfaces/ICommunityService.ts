import { CommunityResponse } from '../dto/community-response.dto';
import { CommunityUpdate } from '../dto/community-update.dto';
import { ListResponse } from 'src/dtos/list.dto';
import { RequestUser } from 'src/types/RequestUser';
import { CommunityQueryDto } from '../dto/community-query.dto';
import { CreateCommunity } from '../dto/community-create.dto';

export interface ICommunityService {
  addUser(userId: number, communityId: number): Promise<CommunityResponse>;
  findById(id: number, user?: RequestUser): Promise<CommunityResponse>;
  findUserCommunities(userId: number): Promise<CommunityResponse[]>;
  findAll(
    user: RequestUser,
    filters?: CommunityQueryDto,
    take?: number,
    page?: number,
  ): Promise<ListResponse<CommunityResponse>>;
  update(id: number, changes: CommunityUpdate): Promise<CommunityResponse>;
  create(user: RequestUser, body: CreateCommunity): Promise<CommunityResponse>;
  delete(user: RequestUser, id: number): Promise<void>;
}

export const ICommunityService = Symbol('ICommunityService');
