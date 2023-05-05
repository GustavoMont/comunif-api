import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { UserRepository } from 'src/user/user-repository.service';
import { CommunityRepository } from './community-repository.service';
import { CommunityResponse } from './dto/community-response.dto';
import { ICommunityService } from './interfaces/ICommunityService';
import { CommunityUpdate } from './dto/community-update.dto';
import { CommunityFilters } from './interfaces/ICommunityRepository';
import { ListResponse } from 'src/dtos/list.dto';
import { RequestUser } from 'src/types/RequestUser';

@Injectable()
export class CommunityService extends ICommunityService {
  constructor(
    private readonly repository: CommunityRepository,
    private readonly userRepository: UserRepository,
  ) {
    super();
  }
  async findUserCommunities(userId: number): Promise<CommunityResponse[]> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new HttpException('Usuário não encontrado', HttpStatus.BAD_REQUEST);
    }
    const communities = await this.repository.findUserCommunities(userId);
    return plainToInstance(CommunityResponse, communities);
  }
  async findById(id: number): Promise<CommunityResponse> {
    const community = await this.repository.findById(id);
    if (!community) {
      throw new HttpException(
        'Comunidade não encontrada',
        HttpStatus.NOT_FOUND,
      );
    }
    return plainToInstance(CommunityResponse, community);
  }
  async addUser(
    userId: number,
    communityId: number,
  ): Promise<CommunityResponse> {
    const user = await this.userRepository.findById(userId);
    if (user === null) {
      throw new HttpException('Usuário não encontrado', HttpStatus.BAD_REQUEST);
    }
    const community = await this.repository.findById(+communityId);
    if (community === null) {
      throw new HttpException(
        'Comunidade não encontrada',
        HttpStatus.BAD_REQUEST,
      );
    }
    const userInCommunity = await this.repository.findUser(communityId, userId);
    if (userInCommunity) {
      throw new HttpException(
        'Usuário já está nessa comunidade',
        HttpStatus.BAD_REQUEST,
      );
    }
    const response = await this.repository.addUser(communityId, userId);
    return plainToInstance(CommunityResponse, response);
  }

  async findAll(
    user?: RequestUser,
    filters?: CommunityFilters,
    take = 20,
    page = 1,
  ): Promise<ListResponse<CommunityResponse>> {
    if (!this.isAdmin(user.roles[0])) {
      filters = { ...filters, isActive: true };
    }
    const total = await this.repository.count(filters);
    const skip = this.generateSkip(page, take);

    const communities = plainToInstance(
      CommunityResponse,
      await this.repository.findAll(filters, take, skip),
    );

    return new ListResponse<CommunityResponse>(communities, total, page, take);
  }
  async update(
    id: number,
    changes: CommunityUpdate,
  ): Promise<CommunityResponse> {
    await this.findById(id);

    const updatedCommunity = await this.repository.update(
      id,
      instanceToPlain(changes),
    );

    return plainToInstance(CommunityResponse, updatedCommunity);
  }
}
