import { Community, User } from '@prisma/client';
import { Repository } from 'src/utils/repositories';
import { CommunityQueryDto } from '../dto/community-query.dto';

export abstract class ICommunityRepository extends Repository {
  abstract addUser(communityId: number, userId: number): Promise<Community>;
  abstract findUser(communityId: number, userId: number): Promise<User>;
  abstract findById(id: number): Promise<Community>;
  abstract findUserCommunities(userId: number): Promise<Community[]>;
  abstract findAll(
    filters?: CommunityQueryDto,
    take?: number,
    skip?: number,
  ): Promise<Community[]>;
  abstract update(id: number, changes: Partial<Community>): Promise<Community>;
  abstract count(filters?: CommunityQueryDto): Promise<number>;
}
