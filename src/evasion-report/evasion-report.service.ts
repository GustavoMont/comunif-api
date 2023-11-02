import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Service } from 'src/utils/services';
import { IEvasionReportService } from './interfaces/IEvasionReportService';
import { RequestUser } from 'src/types/RequestUser';
import { CreateUserEvasionReportDto } from './dto/create-user-evasion-report.dto';
import { EvasionReportResponseDto } from './dto/evasion-report-response.dto';
import { IEvasionReportRepository } from './interfaces/IEvasionReportRepository';
import { plainToInstance } from 'class-transformer';
import { EvasionReport } from 'src/models/EvasionReport';
import { ICommunityService } from 'src/community/interfaces/ICommunityService';
import { IUserService } from 'src/user/interfaces/IUserService';
import { ListResponse } from 'src/dtos/list.dto';
import { EvasionReportFiltersDto } from './dto/evasion-report-filters.dto';
import { CreateAdminEvasionReportDto } from './dto/create-admin-evasion-report.dto';

@Injectable()
export class EvasionReportService
  extends Service
  implements IEvasionReportService
{
  constructor(
    @Inject(IEvasionReportRepository)
    private readonly repository: IEvasionReportRepository,
    @Inject(ICommunityService)
    private readonly communityService: ICommunityService,
    @Inject(IUserService)
    private readonly userService: IUserService,
  ) {
    super();
  }
  async createReportByAdmin(
    data: CreateAdminEvasionReportDto,
    user: RequestUser,
  ): Promise<EvasionReportResponseDto> {
    this.isAdmin(user.roles[0]);
    await this.communityService.findById(data.communityId);
    await this.userService.findById(data.userId);
    const report = await this.repository.create(
      plainToInstance(EvasionReport, data),
    );
    return plainToInstance(EvasionReportResponseDto, report);
  }
  async delete(id: number): Promise<void> {
    await this.findById(id);
    await this.repository.delete(id);
  }
  async findMany(
    page = 1,
    take = 25,
    filters: EvasionReportFiltersDto = {},
  ): Promise<ListResponse<EvasionReportResponseDto>> {
    const skip = this.generateSkip(page, take);
    const [evasionReports, total] = await Promise.all([
      this.repository.findMany(skip, take, filters),
      this.repository.count(filters),
    ]);
    const results = plainToInstance(EvasionReportResponseDto, evasionReports);
    return new ListResponse(results, total, page, take);
  }
  async findById(id: number): Promise<EvasionReportResponseDto> {
    const evasionReport = await this.repository.findById(id);
    if (!evasionReport) {
      throw new HttpException(
        'Relatório de evasão não encontrado',
        HttpStatus.NOT_FOUND,
      );
    }
    return plainToInstance(EvasionReportResponseDto, evasionReport);
  }
  async createReportByUser(
    data: CreateUserEvasionReportDto,
    user: RequestUser,
  ): Promise<EvasionReportResponseDto> {
    if (data.userId !== user.id) {
      throw new HttpException(
        'Você não pode realizar esta ação',
        HttpStatus.FORBIDDEN,
      );
    }
    await this.communityService.findById(data.communityId, user);
    const createData = plainToInstance(EvasionReport, data);
    const evasionReport = await this.repository.create(createData);
    const reportResponse = plainToInstance(
      EvasionReportResponseDto,
      evasionReport,
    );

    return reportResponse;
  }
}
