import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ICommunityUsersService } from './interfaces/ICommunityUsersService';
import { CommunityResponse } from 'src/community/dto/community-response.dto';
import { ICommunityUsersRepostory } from './interfaces/ICommunityUserRepository';
import { UserService } from 'src/user/user.service';
import { plainToInstance } from 'class-transformer';
import { ICommunityService } from 'src/community/interfaces/ICommunityService';
import { ListResponse } from 'src/dtos/list.dto';
import { UserResponse } from 'src/user/dto/user-response.dto';
import { Service } from 'src/utils/services';

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
    private readonly userService: UserService,
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
    const [total, members] = await Promise.all([
      this.repository.countCommunityMembers(communityId),
      this.repository.findCommunityMembers(communityId, { skip, take }),
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
    const userIsInCommunity = await this.repository.findUser(
      communityId,
      userId,
    );
    if (!!userIsInCommunity) {
      throw new HttpException(
        'Usuário já está nessa comunidade',
        HttpStatus.BAD_REQUEST,
      );
    }
    const community = await this.repository.addUser(communityId, userId);
    return plainToInstance(CommunityResponse, { ...community, isMember: true });
  }
}