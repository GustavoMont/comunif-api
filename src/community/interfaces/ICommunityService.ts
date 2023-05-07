import { Service } from 'src/utils/services';
import { CommunityResponse } from '../dto/community-response.dto';
import { CommunityUpdate } from '../dto/community-update.dto';
import { ListResponse } from 'src/dtos/list.dto';
import { RequestUser } from 'src/types/RequestUser';
import { CommunityQueryDto } from '../dto/community-query.dto';

export abstract class ICommunityService extends Service {
  abstract addUser(
    userId: number,
    communityId: number,
  ): Promise<CommunityResponse>;
  abstract findById(id: number): Promise<CommunityResponse>;
  abstract findUserCommunities(userId: number): Promise<CommunityResponse[]>;
  abstract findAll(
    user: RequestUser,
    filters?: CommunityQueryDto,
    take?: number,
    page?: number,
  ): Promise<ListResponse<CommunityResponse>>;
  abstract update(
    id: number,
    changes: CommunityUpdate,
  ): Promise<CommunityResponse>;
}
