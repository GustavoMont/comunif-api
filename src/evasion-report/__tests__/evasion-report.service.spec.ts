import { Test, TestingModule } from '@nestjs/testing';
import { EvasionReportService } from '../evasion-report.service';
import { IEvasionReportRepository } from '../interfaces/IEvasionReportRepository';
import { CreateUserEvasionReportDto } from '../dto/create-user-evasion-report.dto';
import {
  arrayGenerator,
  communityGenerator,
  evasionReportGenerator,
  requestUserGenerator,
  userGenerator,
} from 'src/utils/generators';
import { HttpException, HttpStatus } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { EvasionReportResponseDto } from '../dto/evasion-report-response.dto';
import { ICommunityService } from 'src/community/interfaces/ICommunityService';
import { communityServiceMock } from 'src/community/__mocks__/community-service.mock';
import { CommunityResponse } from 'src/community/dto/community-response.dto';
import { IUserService } from 'src/user/interfaces/IUserService';
import { RoleEnum } from 'src/models/User';
import { UserResponse } from 'src/user/dto/user-response.dto';
import { userServiceMock } from 'src/user/__mocks__/user-service.mock';
import { evasionReportRepositoryMock } from '../__mocks__/evasion-report-repository.mock';
import { ListResponse } from 'src/dtos/list.dto';

describe('EvasionReportService', () => {
  let service: EvasionReportService;
  let repository: IEvasionReportRepository;
  let userService: IUserService;
  let communityService: ICommunityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EvasionReportService,
        {
          provide: IEvasionReportRepository,
          useValue: evasionReportRepositoryMock,
        },
        {
          provide: ICommunityService,
          useValue: communityServiceMock,
        },
        {
          provide: IUserService,
          useValue: userServiceMock,
        },
      ],
    }).compile();

    service = module.get<EvasionReportService>(EvasionReportService);
    repository = module.get<IEvasionReportRepository>(IEvasionReportRepository);
    communityService = module.get<ICommunityService>(ICommunityService);
    userService = module.get<IUserService>(IUserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  describe('createReportByUser', () => {
    const createData: CreateUserEvasionReportDto = {
      communityId: 1,
      reason: 'blablabla',
      userId: 1,
    };
    const evasionReport = evasionReportGenerator({
      removerId: null,
      remover: null,
    });
    const requestUser = requestUserGenerator({ id: 1 });
    it('should throw forbidden exception', async () => {
      await expect(
        service.createReportByUser(createData, { ...requestUser, id: 2 }),
      ).rejects.toThrowError(
        new HttpException(
          'Você não pode realizar esta ação',
          HttpStatus.FORBIDDEN,
        ),
      );
    });
    it('should throw community not found', async () => {
      const exepectedError = new HttpException(
        'Comunidade não encontrada',
        HttpStatus.NOT_FOUND,
      );
      jest
        .spyOn(communityService, 'findById')
        .mockRejectedValue(exepectedError);
      await expect(
        service.createReportByUser(createData, requestUser),
      ).rejects.toThrowError(exepectedError);
      expect(communityService.findById).toBeCalledWith(
        createData.communityId,
        requestUser,
      );
    });
    it('should create a evasion reporyt and report by email', async () => {
      jest.spyOn(repository, 'create').mockResolvedValue(evasionReport);
      const community = communityGenerator();
      const communityResponse = plainToInstance(CommunityResponse, community);
      jest
        .spyOn(communityService, 'findById')
        .mockResolvedValue(communityResponse);
      const communityResponsible = userGenerator({ role: RoleEnum.admin });
      const userResponse = plainToInstance(UserResponse, communityResponsible);
      jest.spyOn(userService, 'findById').mockResolvedValue(userResponse);
      const result = await service.createReportByUser(createData, requestUser);
      const expectedResponse = plainToInstance(
        EvasionReportResponseDto,
        evasionReport,
      );
      expect(result).toStrictEqual(expectedResponse);
      expect(repository.create).toBeCalledWith(createData);
    });
  });
  describe('findById', () => {
    it('should throw not found expection', async () => {
      jest.spyOn(repository, 'findById').mockResolvedValue(null);
      await expect(service.findById(1)).rejects.toThrowError(
        new HttpException(
          'Relatório de evasão não encontrado',
          HttpStatus.NOT_FOUND,
        ),
      );
    });
    it('should return evasion report', async () => {
      const evasionReport = evasionReportGenerator();
      jest.spyOn(repository, 'findById').mockResolvedValue(evasionReport);
      const result = await service.findById(1);
      expect(result).toStrictEqual(
        plainToInstance(EvasionReportResponseDto, evasionReport),
      );
      expect(repository.findById).toBeCalledWith(1);
    });
  });
  describe('findMany', () => {
    const evasionReports = arrayGenerator(10, evasionReportGenerator);
    const total = 10;
    it('should return all by default', async () => {
      jest.spyOn(repository, 'findMany').mockResolvedValue(evasionReports);
      jest.spyOn(repository, 'count').mockResolvedValue(total);
      const response = await service.findMany();
      const evasionReportsResponse = plainToInstance(
        EvasionReportResponseDto,
        evasionReports,
      );
      const expectedResponse = new ListResponse(
        evasionReportsResponse,
        total,
        1,
        25,
      );
      expect(response).toStrictEqual(expectedResponse);
      expect(repository.count).toBeCalled();
      expect(repository.findMany).toBeCalledWith(0, 25, {});
    });
    it('should return filtered reports', async () => {
      jest.spyOn(repository, 'findMany').mockResolvedValue(evasionReports);
      jest.spyOn(repository, 'findMany').mockResolvedValue(evasionReports);
      const filters = { community: 1, user: 1 };
      const response = await service.findMany(2, 10, filters);
      const evasionReportsResponse = plainToInstance(
        EvasionReportResponseDto,
        evasionReports,
      );
      const expectedResponse = new ListResponse(
        evasionReportsResponse,
        total,
        2,
        10,
      );
      expect(response).toStrictEqual(expectedResponse);
      expect(repository.count).toBeCalledWith(filters);
      expect(repository.findMany).toBeCalledWith(10, 10, filters);
    });
  });
  describe('delete', () => {
    const evasionReport = evasionReportGenerator();
    it('should throw report not found', async () => {
      jest.spyOn(repository, 'findById').mockResolvedValue(null);
      await expect(service.delete(1)).rejects.toThrowError(
        new HttpException(
          'Relatório de evasão não encontrado',
          HttpStatus.NOT_FOUND,
        ),
      );
      expect(repository.findById).toBeCalledWith(1);
      expect(repository.delete).not.toBeCalled();
    });
    it('should delete evasion report', async () => {
      jest.spyOn(repository, 'findById').mockResolvedValue(evasionReport);
      await service.delete(1);
      expect(repository.findById).toBeCalledWith(1);
      expect(repository.delete).toBeCalledWith(1);
    });
  });
});
