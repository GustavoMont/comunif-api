import {
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CreateUserEvasionReportDto } from './dto/create-user-evasion-report.dto';
import { IEvasionReportService } from './interfaces/IEvasionReportService';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { User } from 'src/decorators/request-user.decorator';
import { RequestUser } from 'src/types/RequestUser';
import { Roles } from 'src/decorators/roles.decorator';
import { RoleEnum } from 'src/models/User';
import { RolesGuard } from 'src/auth/guards/role.guard';
import { EvasionReportFiltersDto } from './dto/evasion-report-filters.dto';
import { CreateAdminEvasionReportDto } from './dto/create-admin-evasion-report.dto';

@Controller('/api/evasion-reports')
export class EvasionReportController {
  constructor(
    @Inject(IEvasionReportService)
    private readonly service: IEvasionReportService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async leftCommunity(
    @Body() body: CreateUserEvasionReportDto,
    @User() user: RequestUser,
  ) {
    return await this.service.createReportByUser(body, user);
  }
  @Roles(RoleEnum.admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('/ban')
  async banFromCommunity(
    @Body() data: CreateAdminEvasionReportDto,
    @User() user: RequestUser,
  ) {
    return await this.service.createReportByAdmin(data, user);
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.admin)
  @Get()
  async findMany(
    @Query('page') page = 1,
    @Query('take') take = 25,
    @Query() filters: EvasionReportFiltersDto = {},
  ) {
    return await this.service.findMany(page, take, filters);
  }
}
