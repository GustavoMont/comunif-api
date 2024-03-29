import { Test, TestingModule } from '@nestjs/testing';
import { CommunityUsersService } from '../community-users.service';
import { ICommunityService } from 'src/community/interfaces/ICommunityService';
import { ICommunityUsersRepostory } from '../interfaces/ICommunityUserRepository';
import { HttpException, HttpStatus } from '@nestjs/common';
import {
  arrayGenerator,
  communityGenerator,
  communityHasUserGenerator,
  evasionReportGenerator,
  requestUserGenerator,
  userGenerator,
} from 'src/utils/generators';
import { CommunityResponse } from 'src/community/dto/community-response.dto';
import { plainToInstance } from 'class-transformer';
import { ListResponse } from 'src/dtos/list.dto';
import { UserResponse } from 'src/user/dto/user-response.dto';
import { IUserService } from 'src/user/interfaces/IUserService';
import { IEvasionReportService } from 'src/evasion-report/interfaces/IEvasionReportService';
import { communityServiceMock } from 'src/community/__mocks__/community-service.mock';
import { userServiceMock } from 'src/user/__mocks__/user-service.mock';
import { evasionReportServiceMock } from 'src/evasion-report/__mocks__/evasion-report-service.mock';
import { communityUsersRepositoryMock } from '../__mocks__/community-users-repository.mock';
import { EvasionReportResponseDto } from 'src/evasion-report/dto/evasion-report-response.dto';
import { IMailService } from 'src/mail/interfaces/IMailService';
import { mailServiceMock } from 'src/mail/__mocks__/mail-service.mock';
import { RoleEnum } from 'src/models/User';

describe('CommunityUsersService', () => {
  let service: CommunityUsersService;
  let repository: ICommunityUsersRepostory;
  let userService: IUserService;
  let communityService: ICommunityService;
  let evasionReportService: IEvasionReportService;
  let mailService: IMailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommunityUsersService,
        {
          provide: ICommunityUsersRepostory,
          useValue: communityUsersRepositoryMock,
        },
        {
          provide: IUserService,
          useValue: userServiceMock,
        },
        {
          provide: ICommunityService,
          useValue: communityServiceMock,
        },
        {
          provide: IEvasionReportService,
          useValue: evasionReportServiceMock,
        },
        {
          provide: IMailService,
          useValue: mailServiceMock,
        },
      ],
    }).compile();

    service = module.get<CommunityUsersService>(CommunityUsersService);
    repository = module.get<ICommunityUsersRepostory>(ICommunityUsersRepostory);
    userService = module.get<IUserService>(IUserService);
    communityService = module.get<ICommunityService>(ICommunityService);
    evasionReportService = module.get<IEvasionReportService>(
      IEvasionReportService,
    );
    mailService = module.get<IMailService>(IMailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  describe('Add User on community', () => {
    it('should throw user not found exception', async () => {
      //Arrange
      jest
        .spyOn(userService, 'findById')
        .mockRejectedValue(
          new HttpException('Usuário não encontrado', HttpStatus.BAD_REQUEST),
        );
      // Act & Assert
      await expect(service.addUser(1, 1)).rejects.toThrowError(
        new HttpException('Usuário não encontrado', HttpStatus.BAD_REQUEST),
      );
      expect(repository.findUser).not.toBeCalled();
      expect(communityService.findById).not.toBeCalled();
      expect(repository.addUser).not.toBeCalled();
    });
    it('should throw community not found', async () => {
      //Arrange
      jest.spyOn(userService, 'findById').mockResolvedValue(userGenerator());
      jest
        .spyOn(communityService, 'findById')
        .mockRejectedValue(
          new HttpException(
            'Comunidade não encontrada',
            HttpStatus.BAD_REQUEST,
          ),
        );
      // Act & Assert
      await expect(service.addUser(1, 1)).rejects.toThrowError(
        new HttpException('Comunidade não encontrada', HttpStatus.BAD_REQUEST),
      );
      expect(repository.findUser).not.toBeCalled();
      expect(repository.addUser).not.toBeCalled();
    });
    it('should throw user already in comunity error', async () => {
      //Arrange
      jest.spyOn(userService, 'findById').mockResolvedValue(userGenerator());
      jest
        .spyOn(communityService, 'findById')
        .mockResolvedValue(
          plainToInstance(CommunityResponse, communityGenerator()),
        );
      jest
        .spyOn(repository, 'findUser')
        .mockResolvedValue(communityHasUserGenerator());

      //Act & Assert
      await expect(service.addUser(1, 1)).rejects.toThrowError(
        new HttpException(
          'Usuário já está nessa comunidade',
          HttpStatus.BAD_REQUEST,
        ),
      );
      expect(repository.addUser).not.toBeCalled();
    });
    it('should add user', async () => {
      //Arrange
      const community = communityGenerator();
      jest.spyOn(userService, 'findById').mockResolvedValue(userGenerator());
      jest
        .spyOn(communityService, 'findById')
        .mockResolvedValue(plainToInstance(CommunityResponse, community));
      jest.spyOn(repository, 'findUser').mockResolvedValue(null);
      jest.spyOn(repository, 'addUser').mockResolvedValue(community);

      //Act & Assert
      const result = await service.addUser(1, 1);

      expect(plainToInstance(CommunityResponse, result)).toEqual(
        plainToInstance(CommunityResponse, { ...community, isMember: true }),
      );
    });
  });
  describe('List community active members', () => {
    it('should throw community not found', async () => {
      jest
        .spyOn(communityService, 'findById')
        .mockRejectedValue(
          new HttpException('Comunidade não encontrada', HttpStatus.NOT_FOUND),
        );
      await expect(service.findCommunityMembers(1)).rejects.toThrowError(
        new HttpException('Comunidade não encontrada', HttpStatus.NOT_FOUND),
      );
      expect(repository.findCommunityMembers).not.toBeCalled();
      expect(communityService.findById).toBeCalledWith(1);
    });
    it('should return list of communityMembers', async () => {
      const total = 10;
      jest
        .spyOn(communityService, 'findById')
        .mockResolvedValue(
          plainToInstance(CommunityResponse, communityGenerator()),
        );

      const members = arrayGenerator(5, userGenerator);
      const membersResponse = plainToInstance(UserResponse, members);
      jest.spyOn(repository, 'countCommunityMembers').mockResolvedValue(total);
      jest.spyOn(repository, 'findCommunityMembers').mockResolvedValue(members);
      const result = await service.findCommunityMembers(1, 1, 5);
      expect(result).toStrictEqual(
        new ListResponse<UserResponse>(membersResponse, total, 1, 5),
      );
      expect(repository.findCommunityMembers).toBeCalledWith(
        1,
        {
          skip: 0,
          take: 5,
        },
        { user: { isActive: true } },
      );
      expect(repository.countCommunityMembers).toBeCalledWith(1, {
        user: { isActive: true },
      });
    });
  });
  describe('check if user is in community', () => {
    it('should return true', async () => {
      jest
        .spyOn(repository, 'findUser')
        .mockResolvedValue(communityHasUserGenerator());
      const result = await service.isUserInCommunity(1, 1);
      expect(result).toBeTruthy();
    });
    it('should return false', async () => {
      jest.spyOn(repository, 'findUser').mockResolvedValue(null);
      const result = await service.isUserInCommunity(1, 1);
      expect(result).not.toBeTruthy();
    });
  });
  describe('leave community', () => {
    const communityHasUser = communityHasUserGenerator();
    const requestUser = requestUserGenerator({ id: 3 });
    const user = plainToInstance(UserResponse, userGenerator());
    const community = plainToInstance(CommunityResponse, communityGenerator());
    const responsible = plainToInstance(
      UserResponse,
      userGenerator({ role: RoleEnum.admin }),
    );
    const evasionReport = plainToInstance(
      EvasionReportResponseDto,
      evasionReportGenerator({ removerId: responsible.id }),
    );
    const evasionReportResponse = new ListResponse([evasionReport], 1, 1, 1);
    beforeEach(() => {
      jest
        .spyOn(evasionReportService, 'findMany')
        .mockResolvedValue(evasionReportResponse);
    });
    afterEach(jest.clearAllMocks);
    describe('logged as user', () => {
      it('should throw forbbiden exception', async () => {
        const expectedError = new HttpException(
          'Você não tem permissão para realizar essa ação',
          HttpStatus.FORBIDDEN,
        );
        await expect(
          service.leaveCommunity(1, 5, requestUser),
        ).rejects.toThrowError(expectedError);
      });
      it('should throw report was not create exception', async () => {
        const emptyResponse = new ListResponse<EvasionReportResponseDto>(
          [],
          0,
          1,
          25,
        );
        jest
          .spyOn(evasionReportService, 'findMany')
          .mockResolvedValueOnce(emptyResponse);
        await expect(
          service.leaveCommunity(community.id, requestUser.id, requestUser),
        ).rejects.toThrowError(
          new HttpException(
            'Relatório de evasão não foi gerado',
            HttpStatus.BAD_REQUEST,
          ),
        );
        expect(evasionReportService.findMany).toBeCalledWith(1, 1, {
          user: requestUser.id,
          community: community.id,
        });
      });
      it('should throw community does not exist', async () => {
        const expectedError = new HttpException(
          'Comunidade não encontrada',
          HttpStatus.NOT_FOUND,
        );
        jest
          .spyOn(communityService, 'findById')
          .mockRejectedValue(expectedError);
        await expect(
          service.leaveCommunity(1, requestUser.id, requestUser),
        ).rejects.toThrowError(expectedError);
      });
      it('should throw user is not part of community', async () => {
        jest.spyOn(evasionReportService, 'delete').mockResolvedValue();
        jest.spyOn(communityService, 'findById').mockResolvedValue(community);
        jest.spyOn(userService, 'findById').mockResolvedValue(user);
        jest.spyOn(repository, 'findUser').mockResolvedValue(null);
        const expectedError = new HttpException(
          'Usuário não faz parte dessa comunidade',
          HttpStatus.BAD_REQUEST,
        );
        await expect(
          service.leaveCommunity(community.id, requestUser.id, requestUser),
        ).rejects.toThrowError(expectedError);
        const [report] = evasionReportResponse.results;
        expect(evasionReportService.delete).toBeCalledWith(report.id);
      });
      it('should let user leave community', async () => {
        jest.spyOn(communityService, 'findById').mockResolvedValue(community);
        jest
          .spyOn(repository, 'findUser')
          .mockResolvedValueOnce(communityHasUser);
        jest.spyOn(userService, 'findById').mockResolvedValueOnce(responsible);
        jest.spyOn(repository, 'delete').mockResolvedValue();
        await service.leaveCommunity(community.id, requestUser.id, requestUser);
        expect(userService.findById).toBeCalledWith(community.adminId);
        expect(mailService.userLeftCommunity).toBeCalledWith(
          evasionReport,
          responsible,
        );
        expect(repository.delete);
      });
      it('should not notify user', async () => {
        jest.spyOn(communityService, 'findById').mockResolvedValue(community);
        jest
          .spyOn(repository, 'findUser')
          .mockResolvedValueOnce(communityHasUser);
        jest.spyOn(userService, 'findById').mockResolvedValueOnce(responsible);
        jest.spyOn(repository, 'delete').mockResolvedValue();
        await service.leaveCommunity(community.id, requestUser.id, requestUser);
        expect(userService.findById).toBeCalledWith(community.adminId);
        expect(mailService.userLeftCommunity).toBeCalledWith(
          evasionReport,
          responsible,
        );
        expect(repository.delete);
        expect(mailService.notificateBanUser).not.toBeCalled();
      });
    });
    describe('logged as admin', () => {
      const admin = requestUserGenerator({
        id: 2,
        roles: [RoleEnum.admin],
      });
      const userId = admin.id + 2;
      it('should ban user', async () => {
        jest.spyOn(communityService, 'findById').mockResolvedValue(community);
        jest
          .spyOn(repository, 'findUser')
          .mockResolvedValueOnce(communityHasUser);
        jest.spyOn(userService, 'findById').mockResolvedValueOnce(responsible);
        jest.spyOn(repository, 'delete').mockResolvedValue();
        await service.leaveCommunity(community.id, userId, admin);
        expect(repository.delete).toBeCalledWith(communityHasUser.id);
      });
      it('should send e-mail to community admin and user', async () => {
        const evasionReport = plainToInstance(
          EvasionReportResponseDto,
          evasionReportGenerator({ removerId: community.adminId + 2 }),
        );
        const evasionReportResponse = new ListResponse(
          [evasionReport],
          1,
          1,
          1,
        );
        jest
          .spyOn(evasionReportService, 'findMany')
          .mockResolvedValueOnce(evasionReportResponse);
        jest
          .spyOn(communityService, 'findById')
          .mockResolvedValue({ ...community, adminId: admin.id + 4 });
        jest
          .spyOn(repository, 'findUser')
          .mockResolvedValueOnce(communityHasUser);
        jest.spyOn(userService, 'findById').mockResolvedValueOnce(responsible);
        jest.spyOn(repository, 'delete').mockResolvedValue();
        await service.leaveCommunity(community.id, userId, admin);
        expect(mailService.notificateBanUser).toBeCalledWith(evasionReport);
        expect(mailService.notificateBanResponsible).toBeCalledWith(
          evasionReport,
          responsible,
        );
      });
      it('should not notify admin', async () => {
        jest.spyOn(communityService, 'findById').mockResolvedValue(community);
        jest
          .spyOn(repository, 'findUser')
          .mockResolvedValueOnce(communityHasUser);
        jest.spyOn(userService, 'findById').mockResolvedValueOnce(responsible);
        jest.spyOn(repository, 'delete').mockResolvedValue();
        await service.leaveCommunity(community.id, userId, admin);
        expect(mailService.notificateBanUser).toBeCalledWith(evasionReport);
        expect(mailService.notificateBanResponsible).not.toBeCalled();
      });
    });
  });
});
