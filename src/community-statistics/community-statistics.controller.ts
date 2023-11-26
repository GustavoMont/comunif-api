import {
  Controller,
  Get,
  Inject,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { RoleEnum } from 'src/models/User';
import { ICommunityStatisticsService } from './interfaces/ICommunityStatisticsService';
import { StatisticsQueryDto } from 'src/dtos/statistics-query.dto';
import { User } from 'src/decorators/request-user.decorator';
import { RequestUser } from 'src/types/RequestUser';

@Controller('/api/community-statistics')
@Roles(RoleEnum.admin)
@UseGuards(JwtAuthGuard, RolesGuard)
export class CommunityStatisticsController {
  constructor(
    @Inject(ICommunityStatisticsService)
    private readonly service: ICommunityStatisticsService,
  ) {}
  @Get('count')
  async communitiesCount() {
    return await this.service.communitiesCount();
  }
  @Get()
  async findAll(
    @Query('page') page = 1,
    @Query('take') take = 25,
    @Query() filters: StatisticsQueryDto = {},
  ) {
    const isEmpty = Object.keys(filters).length === 0;
    return await this.service.findAll(
      page,
      take,
      isEmpty ? undefined : filters,
    );
  }
  @Post()
  async create(@User() user: RequestUser) {
    return await this.service.create(user);
  }
}
