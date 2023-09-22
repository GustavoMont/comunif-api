import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { CommunityResponse } from './dto/community-response.dto';
import { ICommunityService } from './interfaces/ICommunityService';
import { CommunityUpdate } from './dto/community-update.dto';
import { ListResponse } from 'src/dtos/list.dto';
import { RequestUser } from 'src/types/RequestUser';
import { CommunityQueryDto } from './dto/community-query.dto';
import { CreateCommunity } from './dto/community-create.dto';
import { Community } from 'src/models/Community';
import { ImageService } from 'src/utils/image.service';
import { Service } from 'src/utils/services';
import { ICommunityRepository } from './interfaces/ICommunityRepository';
import { IUserService } from 'src/user/interfaces/IUserService';
@Injectable()
export class CommunityService extends Service implements ICommunityService {
  constructor(
    @Inject(ICommunityRepository)
    private readonly repository: ICommunityRepository,
    @Inject(IUserService) private readonly userService: IUserService,
    private readonly imageService: ImageService,
  ) {
    super();
  }
  async findByChannelId(
    communityChannelId: number,
  ): Promise<CommunityResponse> {
    const community = await this.repository.findByChannelId(communityChannelId);
    if (!community) {
      throw new HttpException(
        'Comunidade não encontrada',
        HttpStatus.NOT_FOUND,
      );
    }
    return plainToInstance(CommunityResponse, community);
  }
  async delete(user: RequestUser, id: number): Promise<void> {
    this.handleForbiddenException(user.roles[0]);
    await this.findById(id, user);
    await this.repository.delete(id);
  }
  async create(
    user: RequestUser,
    body: CreateCommunity,
  ): Promise<CommunityResponse> {
    this.handleForbiddenException(user.roles[0]);
    const hasCommunitySubject = await this.repository.count(
      plainToInstance(CommunityQueryDto, {
        subject: body.subject,
      }),
    );

    if (hasCommunitySubject > 0) {
      throw new HttpException(
        'Já existe uma comunidade com esse assunto',
        HttpStatus.BAD_REQUEST,
      );
    }

    const newCommunity = await this.repository.create(
      plainToInstance(Community, body),
    );

    return plainToInstance(CommunityResponse, newCommunity);
  }
  async findUserCommunities(userId: number): Promise<CommunityResponse[]> {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new HttpException('Usuário não encontrado', HttpStatus.BAD_REQUEST);
    }
    const communities = await this.repository.findUserCommunities(userId);
    return plainToInstance(CommunityResponse, communities);
  }
  async findById(id: number, user?: RequestUser): Promise<CommunityResponse> {
    const community = await this.repository.findById(id);
    if (!community) {
      throw new HttpException(
        'Comunidade não encontrada',
        HttpStatus.NOT_FOUND,
      );
    }
    const communityUser = await this.repository.findUser(
      community.id,
      user?.id || 0,
    );
    const isMember = !!communityUser;

    return plainToInstance(CommunityResponse, {
      ...community,
      isMember,
    });
  }
  async findAll(
    user?: RequestUser,
    filters?: CommunityQueryDto,
    take = 20,
    page = 1,
  ): Promise<ListResponse<CommunityResponse>> {
    if (!this.isAdmin(user.roles[0])) {
      filters = { ...filters, isActive: true };
    }
    const total = await this.repository.count(filters);
    const skip = this.generateSkip(page, take);

    const communities = await this.repository.findAll(filters, take, skip);
    const communitiesWithMembers = await Promise.all(
      communities.map(async (community) => {
        const communityUser = await this.repository.findUser(
          community.id,
          user.id,
        );
        return {
          ...community,
          isMember: !!communityUser,
        };
      }),
    );
    const communitiesResponse = plainToInstance(
      CommunityResponse,
      communitiesWithMembers,
    );

    return new ListResponse<CommunityResponse>(
      communitiesResponse,
      total,
      page,
      take,
    );
  }
  async update(
    id: number,
    changes: CommunityUpdate,
  ): Promise<CommunityResponse> {
    const community = await this.findById(id);

    if (changes.banner && community.banner) {
      await this.imageService.deleteImage(community.banner);
      changes.banner = `${process.env.DOMAIN}/${changes.banner}`;
    }
    const updatedCommunity = await this.repository.update(
      id,
      instanceToPlain(changes),
    );

    return plainToInstance(CommunityResponse, updatedCommunity);
  }
}
