import { Test, TestingModule } from '@nestjs/testing';
import { EvasionReportService } from '../evasion-report.service';
import { IEvasionReportRepository } from '../interfaces/IEvasionReportRepository';
import { CreateUserEvasionReportDto } from '../dto/create-user-evasion-report.dto';
import {
  communityGenerator,
  evasionReportGenerator,
  requestUserGenerator,
  userGenerator,
} from 'src/utils/generators';
import { HttpException, HttpStatus } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { EvasionReportResponseDto } from '../dto/evasion-report-response.dto';
import { IMailService } from 'src/mail/interfaces/IMailService';
import { mailServiceMock } from 'src/mail/__mocks__/mail-service.mock';
import { ICommunityService } from 'src/community/interfaces/ICommunityService';
import { communityServiceMock } from 'src/community/__mocks__/community-service.mock';
import { CommunityResponse } from 'src/community/dto/community-response.dto';
import { IUserService } from 'src/user/interfaces/IUserService';
import { RoleEnum } from 'src/models/User';
import { UserResponse } from 'src/user/dto/user-response.dto';
import { userServiceMock } from 'src/user/__mocks__/user-service.mock';
import { evasionReportRepositoryMock } from '../__mocks__/evasion-report-repository.mock copy';

describe('EvasionReportService', () => {
  let service: EvasionReportService;
  let repository: IEvasionReportRepository;
  let userService: IUserService;
  let communityService: ICommunityService;
  let mailService: IMailService;

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
        {
          provide: IMailService,
          useValue: mailServiceMock,
        },
      ],
    }).compile();

    service = module.get<EvasionReportService>(EvasionReportService);
    repository = module.get<IEvasionReportRepository>(IEvasionReportRepository);
    communityService = module.get<ICommunityService>(ICommunityService);
    userService = module.get<IUserService>(IUserService);
    mailService = module.get<IMailService>(IMailService);
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
      jest.spyOn(mailService, 'userLeftCommunity').mockResolvedValue();
      const result = await service.createReportByUser(createData, requestUser);
      const expectedResponse = plainToInstance(
        EvasionReportResponseDto,
        evasionReport,
      );
      expect(result).toStrictEqual(expectedResponse);
      expect(repository.create).toBeCalledWith(createData);
      expect(userService.findById).toBeCalledWith(userResponse.id);
      expect(mailService.userLeftCommunity).toBeCalledWith(
        expectedResponse,
        userResponse,
      );
    });
  });
});
