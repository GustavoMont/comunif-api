import { Service } from 'src/utils/services';
import { CommunityResponse } from '../dto/community-response.dto';
import { CommunityUpdate } from '../dto/community-update.dto';
import { CommunityFilters } from './ICommunityRepository';
import { ListResponse } from 'src/dtos/list.dto';
import { RequestUser } from 'src/types/RequestUser';

export abstract class ICommunityService extends Service {
  abstract addUser(
    userId: number,
    communityId: number,
  ): Promise<CommunityResponse>;
  abstract findById(id: number): Promise<CommunityResponse>;
  abstract findUserCommunities(userId: number): Promise<CommunityResponse[]>;
  abstract findAll(
    user: RequestUser,
    filters?: CommunityFilters,
    take?: number,
    page?: number,
  ): Promise<ListResponse<CommunityResponse>>;
  abstract update(
    id: number,
    changes: CommunityUpdate,
  ): Promise<CommunityResponse>;
}
