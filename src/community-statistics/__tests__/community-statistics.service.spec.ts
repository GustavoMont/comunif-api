import { Test, TestingModule } from '@nestjs/testing';
import { CommunityStatisticsService } from '../community-statistics.service';
import { ICommunityStatisticsRepository } from '../interfaces/ICommunityStatisticsRepository';
import { repositoryMock } from '../__mocks__/repository.mock';
import {
  arrayGenerator,
  communityStatisticsGenerator,
  requestUserGenerator,
} from 'src/utils/generators';
import { plainToInstance } from 'class-transformer';
import { CommunityStatisticsDto } from '../dto/community-statistics.dto';
import { ListResponse } from 'src/dtos/list.dto';
import { StatisticsQueryDto } from 'src/dtos/statistics-query.dto';
import * as moment from 'moment';
import { ICommunityService } from 'src/community/interfaces/ICommunityService';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('CommunityStatisticsService', () => {
  let service: CommunityStatisticsService;
  let repository: ICommunityStatisticsRepository;
  let communityService: ICommunityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommunityStatisticsService,
        {
          provide: ICommunityStatisticsRepository,
          useValue: repositoryMock,
        },
        {
          provide: ICommunityService,
          useValue: {
            count: jest.fn(),
          } as Partial<ICommunityService>,
        },
      ],
    }).compile();

    service = module.get<CommunityStatisticsService>(
      CommunityStatisticsService,
    );
    repository = module.get<ICommunityStatisticsRepository>(
      ICommunityStatisticsRepository,
    );
    communityService = module.get<ICommunityService>(ICommunityService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  describe('findAll', () => {
    const total = 3;
    const communityStatistics = arrayGenerator(
      10,
      communityStatisticsGenerator,
    );
    it('should return community statistics from last two months', async () => {
      jest.spyOn(repository, 'count').mockResolvedValue(total);
      jest.spyOn(repository, 'findAll').mockResolvedValue(communityStatistics);
      const statisticsResponse = plainToInstance(
        CommunityStatisticsDto,
        communityStatistics,
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
    it('should return community statistics filtered', async () => {
      jest.spyOn(repository, 'count').mockResolvedValue(total);
      jest.spyOn(repository, 'findAll').mockResolvedValue(communityStatistics);
      const statisticsResponse = plainToInstance(
        CommunityStatisticsDto,
        communityStatistics,
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
  describe('communityCount', () => {
    const total = 10;
    it('should return only activity communities count', async () => {
      jest.spyOn(communityService, 'count').mockResolvedValue({ total });
      const result = await service.communitiesCount();
      expect(result).toStrictEqual({ total });
      expect(communityService.count).toBeCalledWith({ isActive: true });
    });
  });
  describe('create', () => {
    const communityStatistics = communityStatisticsGenerator();
    const count = 15;
    const admin = requestUserGenerator();
    beforeEach(() => {
      jest.spyOn(repository, 'create').mockResolvedValue(communityStatistics);
      jest.spyOn(repository, 'count').mockResolvedValue(0);
      jest.spyOn(communityService, 'count').mockResolvedValue({ total: count });
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
        plainToInstance(CommunityStatisticsDto, communityStatistics),
      );
      expect(repository.create).toBeCalledWith({
        userId: admin.id,
        count,
      });
    });
    it('should create without user', async () => {
      const result = await service.create();
      expect(result).toStrictEqual(
        plainToInstance(CommunityStatisticsDto, communityStatistics),
      );
      expect(repository.create).toBeCalledWith({
        count,
      });
    });
  });
});
