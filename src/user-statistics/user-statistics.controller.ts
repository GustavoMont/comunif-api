import {
  Controller,
  Get,
  Inject,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { IUserStatisticsService } from './interfaces/IUserStatisticsService';
import { StatisticsQueryDto } from 'src/dtos/statistics-query.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { RoleEnum } from 'src/models/User';
import { User } from 'src/decorators/request-user.decorator';
import { RequestUser } from 'src/types/RequestUser';

@Controller('api/user-statistics')
@Roles(RoleEnum.admin)
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserStatisticsController {
  constructor(
    @Inject(IUserStatisticsService)
    private readonly service: IUserStatisticsService,
  ) {}

  @Get('/count')
  async userCount() {
    return await this.service.userCount();
  }

  @Get()
  async findAll(
    @Query('page') page = 1,
    @Query('take') take = 25,
    @Query()
    filters?: StatisticsQueryDto,
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
