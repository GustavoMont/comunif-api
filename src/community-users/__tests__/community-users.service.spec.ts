import { Test, TestingModule } from '@nestjs/testing';
import { CommunityUsersService } from '../community-users.service';
import { UserService } from 'src/user/user.service';
import { ICommunityService } from 'src/community/interfaces/ICommunityService';
import { ICommunityUsersRepostory } from '../interfaces/ICommunityUserRepository';
import { HttpException, HttpStatus } from '@nestjs/common';
import {
  arrayGenerator,
  communityGenerator,
  userGenerator,
} from 'src/utils/generators';
import { CommunityResponse } from 'src/community/dto/community-response.dto';
import { plainToInstance } from 'class-transformer';
import { ListResponse } from 'src/dtos/list.dto';
import { UserResponse } from 'src/user/dto/user-response.dto';

describe('CommunityUsersService', () => {
  let service: CommunityUsersService;
  let repository: ICommunityUsersRepostory;
  let userService: UserService;
  let communityService: ICommunityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommunityUsersService,
        {
          provide: ICommunityUsersRepostory,
          useValue: {
            addUser: jest.fn(),
            findUser: jest.fn(),
            findCommunityMembers: jest.fn(),
            countCommunityMembers: jest.fn(),
          } as ICommunityUsersRepostory,
        },
        {
          provide: UserService,
          useValue: {
            findById: jest.fn(),
            findAll: jest.fn(),
          },
        },
        {
          provide: ICommunityService,
          useValue: {
            findById: jest.fn(),
          } as Partial<ICommunityService>,
        },
      ],
    }).compile();

    service = module.get<CommunityUsersService>(CommunityUsersService);
    repository = module.get<ICommunityUsersRepostory>(ICommunityUsersRepostory);
    userService = module.get<UserService>(UserService);
    communityService = module.get<ICommunityService>(ICommunityService);
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
      jest.spyOn(repository, 'findUser').mockResolvedValue(userGenerator());

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
  describe('List community members', () => {
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
    });
  });
  describe('check if user is in community', () => {
    it('should return true', async () => {
      jest.spyOn(repository, 'findUser').mockResolvedValue(userGenerator());
      const result = await service.isUserInCommunity(1, 1);
      expect(result).toBeTruthy();
    });
    it('should return false', async () => {
      jest.spyOn(repository, 'findUser').mockResolvedValue(null);
      const result = await service.isUserInCommunity(1, 1);
      expect(result).not.toBeTruthy();
    });
  });
});
