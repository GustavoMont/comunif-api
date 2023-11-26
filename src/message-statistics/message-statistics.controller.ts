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
import { StatisticsQueryDto } from 'src/dtos/statistics-query.dto';
import { RoleEnum } from 'src/models/User';
import { IMessageStatisticsService } from './interfaces/IMessageStatisticsService';
import { User } from 'src/decorators/request-user.decorator';
import { RequestUser } from 'src/types/RequestUser';

@Controller('/api/message-statistics')
@Roles(RoleEnum.admin)
@UseGuards(JwtAuthGuard, RolesGuard)
export class MessageStatisticsController {
  constructor(
    @Inject(IMessageStatisticsService)
    private readonly service: IMessageStatisticsService,
  ) {}
  @Get()
  async findAll(
    @Query('page') page = 1,
    @Query('take') take = 25,
    @Query() filters?: StatisticsQueryDto,
  ) {
    return await this.service.findAll(page, take, filters);
  }

  @Get('/count')
  async count() {
    return await this.service.countMessages();
  }

  @Post()
  async create(@User() user: RequestUser) {
    return await this.service.create(user);
  }
}
