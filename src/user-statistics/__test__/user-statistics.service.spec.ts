import { Test, TestingModule } from '@nestjs/testing';
import { UserStatisticsService } from '../user-statistics.service';
import { IUserService } from 'src/user/interfaces/IUserService';
import { plainToInstance } from 'class-transformer';
import { IUserStatisticsRepository } from '../interfaces/IUserStatisticsRepository';
import {
  arrayGenerator,
  requestUserGenerator,
  userStatisticsGenerator,
} from 'src/utils/generators';
import { UserStatisticsDto } from '../dto/user-statistics.dto';
import { StatisticsQueryDto } from 'src/dtos/statistics-query.dto';
import * as moment from 'moment';
import { ListResponse } from 'src/dtos/list.dto';
import { CountDto } from 'src/dtos/count.dto';
import { userStatisticsRepositoryMock } from '../__mocks__/user-statistics-repositoy.mock';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('UserStatisticsService', () => {
  let service: UserStatisticsService;
  let repository: IUserStatisticsRepository;
  let userService: IUserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserStatisticsService,
        {
          provide: IUserService,
          useValue: {
            count: jest.fn(),
          },
        },
        {
          provide: IUserStatisticsRepository,
          useValue: userStatisticsRepositoryMock,
        },
      ],
    }).compile();

    service = module.get<UserStatisticsService>(UserStatisticsService);
    userService = module.get<IUserService>(IUserService);
    repository = module.get<IUserStatisticsRepository>(
      IUserStatisticsRepository,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  describe('userCount', () => {
    const total = 5;
    it('should return users count', async () => {
      const response = plainToInstance(CountDto, { total });
      jest.spyOn(userService, 'count').mockResolvedValue(response);
      const result = await service.userCount();
      expect(result).toStrictEqual(response);
      expect(userService.count).toBeCalledWith({ isActive: true });
    });
  });
  describe('findAll', () => {
    const total = 10;
    const take = 25;
    const userStatistics = arrayGenerator(total, userStatisticsGenerator);
    it('should return statistics from last two monts by default', async () => {
      jest.spyOn(repository, 'count').mockResolvedValue(total);
      jest.spyOn(repository, 'findAll').mockResolvedValue(userStatistics);
      const result = await service.findAll();
      const statisticsResponse = plainToInstance(
        UserStatisticsDto,
        userStatistics,
      );

      expect(result).toStrictEqual(
        new ListResponse(statisticsResponse, total, 1, 25),
      );
      const defaultFilter: StatisticsQueryDto =
        service.generateDefaultFilters();
      expect(repository.count).toBeCalledWith(defaultFilter);
      expect(repository.findAll).toBeCalledWith(
        { skip: 0, take },
        defaultFilter,
      );
    });
    it('should return statistics by filters', async () => {
      jest.spyOn(repository, 'count').mockResolvedValue(total);
      jest.spyOn(repository, 'findAll').mockResolvedValue(userStatistics);
      const filters: StatisticsQueryDto = {
        from: new Date(moment().subtract(2, 'months').format('YYYY-MM-DD')),
        to: new Date(moment().add(2, 'months').format('YYYY-MM-DD')),
      };
      const statisticsResponse = plainToInstance(
        UserStatisticsDto,
        userStatistics,
      );

      const result = await service.findAll(1, 25, filters);
      expect(result).toStrictEqual(
        new ListResponse(statisticsResponse, total, 1, 25),
      );
      expect(repository.count).toBeCalledWith(filters);
      expect(repository.findAll).toBeCalledWith({ skip: 0, take }, filters);
    });
  });
  describe('create', () => {
    const userStatistics = userStatisticsGenerator();
    const count = 15;
    const admin = requestUserGenerator();
    beforeEach(() => {
      jest.spyOn(repository, 'create').mockResolvedValue(userStatistics);
      jest.spyOn(repository, 'count').mockResolvedValue(0);
      jest.spyOn(userService, 'count').mockResolvedValue({ total: count });
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
        plainToInstance(UserStatisticsDto, userStatistics),
      );
      expect(repository.create).toBeCalledWith({
        userId: admin.id,
        count,
      });
    });
    it('should create without user', async () => {
      const result = await service.create();
      expect(result).toStrictEqual(
        plainToInstance(UserStatisticsDto, userStatistics),
      );
      expect(repository.create).toBeCalledWith({
        count,
      });
    });
  });
});
