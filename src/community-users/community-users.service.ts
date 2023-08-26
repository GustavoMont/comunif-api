import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ICommunityUsersService } from './interfaces/ICommunityUsersService';
import { CommunityResponse } from 'src/community/dto/community-response.dto';
import { ICommunityUsersRepostory } from './interfaces/ICommunityUserRepository';
import { UserService } from 'src/user/user.service';
import { plainToInstance } from 'class-transformer';
import { ICommunityService } from 'src/community/interfaces/ICommunityService';

@Injectable()
export class CommunityUsersService implements ICommunityUsersService {
  constructor(
    @Inject(ICommunityUsersRepostory)
    private readonly repository: ICommunityUsersRepostory,
    @Inject(ICommunityService)
    private readonly communityService: ICommunityService,
    private readonly userService: UserService,
  ) {}
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
