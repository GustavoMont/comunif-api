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
import { RequestUser } from 'src/types/RequestUser';
import { IEvasionReportService } from 'src/evasion-report/interfaces/IEvasionReportService';
import { IMailService } from 'src/mail/interfaces/IMailService';
import { EvasionReportResponseDto } from 'src/evasion-report/dto/evasion-report-response.dto';

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
    @Inject(IEvasionReportService)
    private readonly evasionReportService: IEvasionReportService,
    @Inject(IMailService)
    private readonly mailService: IMailService,
  ) {
    super();
  }
  async handleLeaveCommunityMail(
    evasionReport: EvasionReportResponseDto,
    responsable: UserResponse,
    isAdmin = false,
  ) {
    if (isAdmin) {
      await this.mailService.notificateBanUser(evasionReport);
      if (responsable.id !== evasionReport.removerId) {
        await this.mailService.notificateBanResponsible(
          evasionReport,
          responsable,
        );
      }
      return;
    }
    await this.mailService.userLeftCommunity(evasionReport, responsable);
  }
  async leaveCommunity(
    communityId: number,
    userId: number,
    user: RequestUser,
  ): Promise<void> {
    const isAdmin = this.isAdmin(user.roles[0]);
    if (userId !== user.id && !isAdmin) {
      throw new HttpException(
        'Você não tem permissão para realizar essa ação',
        HttpStatus.FORBIDDEN,
      );
    }
    const community = await this.communityService.findById(communityId, user);
    const evasionReports = await this.evasionReportService.findMany(1, 1, {
      community: communityId,
      user: userId,
    });
    const [evasionReport] = evasionReports.results;
    if (!evasionReport) {
      throw new HttpException(
        'Relatório de evasão não foi gerado',
        HttpStatus.BAD_REQUEST,
      );
    }
    const communityHasUser = await this.repository.findUser(
      communityId,
      userId,
    );
    if (!communityHasUser) {
      await this.evasionReportService.delete(evasionReport.id);
      throw new HttpException(
        'Usuário não faz parte dessa comunidade',
        HttpStatus.BAD_REQUEST,
      );
    }
    const responsible = await this.userService.findById(community.adminId);
    await this.repository.delete(communityHasUser.id);
    await this.handleLeaveCommunityMail(evasionReport, responsible, isAdmin);
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
    const isInCommunity = await this.repository.findUser(communityId, userId);
    return Boolean(isInCommunity);
  }
}
