import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { IMessageStatisticsService } from './interfaces/IMessageStatisticsService';
import { ListResponse } from 'src/dtos/list.dto';
import { StatisticsQueryDto } from 'src/dtos/statistics-query.dto';
import { RequestUser } from 'src/types/RequestUser';
import { MessageStatisticsDto } from './dto/message-statistics.dto';
import { BaseStatisticService } from 'src/utils/BaseStatisticService';
import { CountDto } from 'src/dtos/count.dto';
import { IMessageStatisticsRepository } from './interfaces/IMessageStatisticsRepository';
import { plainToInstance } from 'class-transformer';
import { IMessageService } from 'src/message/interfaces/IMessageService';
import * as moment from 'moment';

@Injectable()
export class MessageStatisticsService
  extends BaseStatisticService
  implements IMessageStatisticsService
{
  private readonly logger: Logger = new Logger(MessageStatisticsService.name);
  constructor(
    @Inject(IMessageStatisticsRepository)
    private readonly repository: IMessageStatisticsRepository,
    @Inject(IMessageService)
    private readonly messageServices: IMessageService,
  ) {
    super();
  }

  async create(user?: RequestUser): Promise<MessageStatisticsDto> {
    const { firstDay: from, lastDay: to } = this.getMonthRange();
    const count = await this.repository.count({ from, to });
    if (count > 0) {
      this.logger.error('Message statistics altready exists');
      throw new HttpException(
        'As estatísticas desse mês já foram geradas',
        HttpStatus.BAD_REQUEST,
      );
    }
    const { total } = await this.countMessages();
    const communityStatistics = await this.repository.create({
      count: total,
      userId: user?.id,
    });
    this.logger.log('Message statistics was created successfuly');
    return plainToInstance(MessageStatisticsDto, communityStatistics);
  }
  async findAll(
    page: number,
    take: number,
    filters: StatisticsQueryDto = this.generateDefaultFilters(),
  ): Promise<ListResponse<MessageStatisticsDto>> {
    const skip = this.generateSkip(page, take);
    const [total, statistics] = await Promise.all([
      this.repository.count(filters),
      this.repository.findAll({ skip, take }, filters),
    ]);
    const statisticsResponse = plainToInstance(
      MessageStatisticsDto,
      statistics,
    );
    return new ListResponse(statisticsResponse, total, page, take);
  }
  async countMessages(): Promise<CountDto> {
    const total = await this.messageServices.countMessages({
      from: moment().startOf('month').toDate(),
      to: moment().endOf('month').toDate(),
    });
    return plainToInstance(CountDto, { total });
  }
}
