import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ICommunityUsersService } from './interfaces/ICommunityUsersService';
import { CommunityResponse } from 'src/community/dto/community-response.dto';
import { ICommunityUsersRepostory } from './interfaces/ICommunityUserRepository';
import { plainToInstance } from 'class-transformer';
import { ICommunityService } from 'src/community/interfaces/ICommunityService';
import { ListResponse } from 'src/dtos/list.dto';
import { UserResponse } from 'src/user/dto/user-response.dto';
import { Service } from 'src/utils/services';
import { IUserService } from 'src/user/interfaces/IUserService';
import { CommunityUsersQueryDto } from './dto/community-users-query.dto';

@Injectable()
export class CommunityUsersService
  extends Service
  implements ICommunityUsersService
{
  constructor(
    @Inject(ICommunityUsersRepostory)
    private readonly repository: ICommunityUsersRepostory,
    @Inject(ICommunityService)
    private readonly communityService: ICommunityService,
    @Inject(IUserService)
    private readonly userService: IUserService,
  ) {
    super();
  }
  async findCommunityMembers(
    communityId: number,
    page = 1,
    take = 20,
  ): Promise<ListResponse<UserResponse>> {
    await this.communityService.findById(communityId);
    const skip = this.generateSkip(page, take);
    const filter = new CommunityUsersQueryDto();
    filter.user = { isActive: true };
    const [total, members] = await Promise.all([
      this.repository.countCommunityMembers(communityId, filter),
      this.repository.findCommunityMembers(communityId, { skip, take }, filter),
    ]);
    const membersResponse = plainToInstance(UserResponse, members);
    return new ListResponse<UserResponse>(membersResponse, total, page, take);
  }

  async addUser(
    communityId: number,
    userId: number,
  ): Promise<CommunityResponse> {
    await this.userService.findById(userId);

    await this.communityService.findById(communityId);

    const isUserInCommunity = await this.isUserInCommunity(userId, communityId);

    if (isUserInCommunity) {
      throw new HttpException(
        'Usuário já está nessa comunidade',
        HttpStatus.BAD_REQUEST,
      );
    }
    const community = await this.repository.addUser(communityId, userId);
    return plainToInstance(CommunityResponse, { ...community, isMember: true });
  }
  async isUserInCommunity(
    userId: number,
    communityId: number,
  ): Promise<boolean> {
    const user = await this.repository.findUser(communityId, userId);
    return Boolean(user);
  }
}
