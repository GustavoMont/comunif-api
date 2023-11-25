import { Test, TestingModule } from '@nestjs/testing';
import { MessageStatisticsService } from '../message-statistics.service';
import { plainToInstance } from 'class-transformer';
import { IMessageStatisticsRepository } from '../interfaces/IMessageStatisticsRepository';
import { messageStatisticsRepositoryMock } from '../__mocks__/message-statistics-repository.mock';
import { IMessageService } from 'src/message/interfaces/IMessageService';
import { messageServiceMock } from 'src/message/__mocks__/message-service.mock';
import {
  arrayGenerator,
  messageStatisticsGenerator,
  requestUserGenerator,
} from 'src/utils/generators';
import { MessageStatisticsDto } from '../dto/message-statistics.dto';
import { StatisticsQueryDto } from 'src/dtos/statistics-query.dto';
import * as moment from 'moment';
import { ListResponse } from 'src/dtos/list.dto';
import { HttpException, HttpStatus } from '@nestjs/common';
import { CountDto } from 'src/dtos/count.dto';

describe('MessageStatisticsService', () => {
  let service: MessageStatisticsService;
  let repository: IMessageStatisticsRepository;
  let messageService: IMessageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessageStatisticsService,
        {
          provide: IMessageStatisticsRepository,
          useValue: messageStatisticsRepositoryMock,
        },
        {
          provide: IMessageService,
          useValue: messageServiceMock,
        },
      ],
    }).compile();

    service = module.get<MessageStatisticsService>(MessageStatisticsService);
    repository = module.get<IMessageStatisticsRepository>(
      IMessageStatisticsRepository,
    );
    messageService = module.get<IMessageService>(IMessageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  describe('findAll', () => {
    const total = 3;
    const messageStatistics = arrayGenerator(10, messageStatisticsGenerator);
    it('should return message statistics from last two months', async () => {
      jest.spyOn(repository, 'count').mockResolvedValue(total);
      jest.spyOn(repository, 'findAll').mockResolvedValue(messageStatistics);
      const statisticsResponse = plainToInstance(
        MessageStatisticsDto,
        messageStatistics,
      );
      const defaultFilter: StatisticsQueryDto =
        service.generateDefaultFilters();
      const result = await service.findAll(1, 25);
      expect(result).toStrictEqual(
        new ListResponse(statisticsResponse, total, 1, 25),
      );
      expect(repository.count).toBeCalledWith(defaultFilter);
      expect(repository.findAll).toBeCalledWith(
        { skip: 0, take: 25 },
        defaultFilter,
      );
    });
    it('should return message statistics filtered', async () => {
      jest.spyOn(repository, 'count').mockResolvedValue(total);
      jest.spyOn(repository, 'findAll').mockResolvedValue(messageStatistics);
      const statisticsResponse = plainToInstance(
        MessageStatisticsDto,
        messageStatistics,
      );
      const expectedFilter: StatisticsQueryDto = {
        from: new Date(moment().add(2, 'months').format('YYYY-MM-DD')),
        to: new Date(moment().add(4, 'months').format('YYYY-MM-DD')),
      };
      const result = await service.findAll(1, 25, expectedFilter);
      expect(result).toStrictEqual(
        new ListResponse(statisticsResponse, total, 1, 25),
      );
      expect(repository.count).toBeCalledWith(expectedFilter);
      expect(repository.findAll).toBeCalledWith(
        { skip: 0, take: 25 },
        expectedFilter,
      );
    });
  });
  describe('messagesCount', () => {
    const total = 10;
    it('should return only messages of current month', async () => {
      jest.spyOn(messageService, 'countMessages').mockResolvedValue(total);
      const result = await service.countMessages();
      expect(result).toStrictEqual(plainToInstance(CountDto, { total }));
      expect(messageService.countMessages).toBeCalledWith({
        from: moment().startOf('month').toDate(),
        to: moment().endOf('month').toDate(),
      });
    });
  });
  describe('create', () => {
    const messageStatistics = messageStatisticsGenerator();
    const count = 15;
    const admin = requestUserGenerator();
    beforeEach(() => {
      jest.spyOn(repository, 'create').mockResolvedValue(messageStatistics);
      jest.spyOn(repository, 'count').mockResolvedValue(0);
      jest.spyOn(messageService, 'countMessages').mockResolvedValue(count);
    });
    it('should throw error when month already has statistics', async () => {
      jest.spyOn(repository, 'count').mockResolvedValueOnce(1);
      const expectedError = new HttpException(
        'As estatísticas desse mês já foram geradas',
        HttpStatus.BAD_REQUEST,
      );
      await expect(service.create()).rejects.toThrowError(expectedError);
    });
    it('should create with user', async () => {
      const result = await service.create(admin);
      expect(result).toStrictEqual(
        plainToInstance(MessageStatisticsDto, messageStatistics),
      );
      expect(repository.create).toBeCalledWith({
        userId: admin.id,
        count,
      });
    });
    it('should create without user', async () => {
      const result = await service.create();
      expect(result).toStrictEqual(
        plainToInstance(MessageStatisticsDto, messageStatistics),
      );
      expect(repository.create).toBeCalledWith({
        count,
      });
    });
  });
});
