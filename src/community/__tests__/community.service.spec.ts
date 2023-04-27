import { HttpException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { plainToInstance } from 'class-transformer';
import { IUserRepository } from 'src/user/interfaces/IUserRepository';
import { UserRepository } from 'src/user/user-repository.service';
import {
  arrayGenerator,
  communityGenerator,
  userGenerator,
} from 'src/utils/generators';
import { CommunityRepository } from '../community-repository.service';
import { CommunityService } from '../community.service';
import { CommunityResponse } from '../dto/community-response.dto';
import { ICommunityRepository } from '../interfaces/ICommunityRepository';
import { Community } from '@prisma/client';
import { CommunityUpdate } from '../dto/community-update.dto';

describe('Community Service', () => {
  let repository: CommunityRepository;
  let userRepository: UserRepository;
  let communityService: CommunityService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommunityService,
        {
          provide: CommunityRepository,
          useValue: {
            addUser: jest.fn(),
            findUser: jest.fn(),
            findById: jest.fn(),
            findUserCommunities: jest.fn(),
            findAll: jest.fn(),
            update: jest.fn(),
          } as ICommunityRepository,
        },
        {
          provide: UserRepository,
          useValue: {
            findById: jest.fn(),
            findAll: jest.fn(),
          } as Partial<IUserRepository>,
        },
      ],
    }).compile();
    userRepository = module.get<UserRepository>(UserRepository);

    communityService = module.get<CommunityService>(CommunityService);
    repository = module.get<CommunityRepository>(CommunityRepository);
  });

  it('should be defined', () => {
    expect(communityService).toBeDefined();
    expect(repository).toBeDefined();
  });
  describe('Add User on community', () => {
    it('should throw user not found exception', async () => {
      //Arrange
      jest.spyOn(userRepository, 'findById').mockResolvedValue(null);
      // Act & Assert
      await expect(communityService.addUser(1, 1)).rejects.toThrowError(
        new HttpException('Usuário não encontrado', HttpStatus.BAD_REQUEST),
      );
      expect(repository.findUser).not.toBeCalled();
      expect(repository.findById).not.toBeCalled();
      expect(repository.addUser).not.toBeCalled();
    });
    it('should throw community not found', async () => {
      //Arrange
      jest.spyOn(userRepository, 'findById').mockResolvedValue(userGenerator());
      jest.spyOn(repository, 'findById').mockResolvedValue(null);
      // Act & Assert
      await expect(communityService.addUser(1, 1)).rejects.toThrowError(
        new HttpException('Comunidade não encontrada', HttpStatus.BAD_REQUEST),
      );
      expect(repository.findUser).not.toBeCalled();
      expect(repository.addUser).not.toBeCalled();
    });
    it('should throw user already in comunity error', async () => {
      //Arrange
      jest.spyOn(userRepository, 'findById').mockResolvedValue(userGenerator());
      jest
        .spyOn(repository, 'findById')
        .mockResolvedValue(communityGenerator());
      jest.spyOn(repository, 'findUser').mockResolvedValue(userGenerator());

      //Act & Assert
      await expect(communityService.addUser(1, 1)).rejects.toThrowError(
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
      jest.spyOn(userRepository, 'findById').mockResolvedValue(userGenerator());
      jest.spyOn(repository, 'findById').mockResolvedValue(community);
      jest.spyOn(repository, 'findUser').mockResolvedValue(null);
      jest.spyOn(repository, 'addUser').mockResolvedValue(community);

      //Act & Assert
      const result = await communityService.addUser(1, 1);

      expect(plainToInstance(CommunityResponse, result)).toEqual(
        plainToInstance(CommunityResponse, community),
      );
    });
  });
  describe('get community', () => {
    it('should return not fount', async () => {
      // Arrange
      jest.spyOn(repository, 'findById').mockResolvedValue(null);
      // Act & Assert
      await expect(communityService.findById(1)).rejects.toThrowError(
        new HttpException('Comunidade não encontrada', HttpStatus.NOT_FOUND),
      );
    });
    it('should return community', async () => {
      // Arrange
      const community = communityGenerator();
      jest.spyOn(repository, 'findById').mockResolvedValue(community);
      // Act
      const result = await communityService.findById(1);
      // Assert
      expect(plainToInstance(CommunityResponse, result)).toEqual(
        plainToInstance(CommunityResponse, community),
      );
    });
  });
  describe('get user communities', () => {
    it('should throw user does not exist', async () => {
      jest.spyOn(userRepository, 'findById').mockResolvedValue(null);

      await expect(
        communityService.findUserCommunities(1),
      ).rejects.toThrowError(
        new HttpException('Usuário não encontrado', HttpStatus.BAD_REQUEST),
      );
      expect(repository.findUserCommunities).not.toBeCalled();
    });
    it('should return all user communities', async () => {
      jest.spyOn(userRepository, 'findById').mockResolvedValue(userGenerator());
      const communities = arrayGenerator<Community>(3, communityGenerator);
      jest
        .spyOn(repository, 'findUserCommunities')
        .mockResolvedValue(communities);
      const result = await communityService.findUserCommunities(1);
      expect(plainToInstance(CommunityResponse, result)).toEqual(
        plainToInstance(CommunityResponse, communities),
      );
    });
  });
  describe('get all communities', () => {
    it('should return all communities', async () => {
      const communities = arrayGenerator<Community>(3, communityGenerator);
      jest.spyOn(repository, 'findAll').mockResolvedValue(communities);
      const result = await communityService.findAll(true);
      expect(plainToInstance(CommunityResponse, result)).toEqual(
        plainToInstance(CommunityResponse, communities),
      );
    });
    it('should return only active communities', async () => {
      const communities = arrayGenerator<Community>(3, communityGenerator);
      jest.spyOn(repository, 'findAll').mockResolvedValue(communities);
      const result = await communityService.findAll();
      expect(plainToInstance(CommunityResponse, result)).toEqual(
        plainToInstance(CommunityResponse, communities),
      );
      expect(repository.findAll).toBeCalledWith(false);
    });
  });
  describe('update community', () => {
    const changes = plainToInstance(CommunityUpdate, {
      name: 'comunidade',
      banner: 'bannerUrl',
    });
    it('should throw community not found', async () => {
      const id = 1;
      jest.spyOn(repository, 'findById').mockResolvedValue(null);
      await expect(communityService.update(id, changes)).rejects.toThrowError(
        new HttpException('Comunidade não encontrada', HttpStatus.NOT_FOUND),
      );
      expect(repository.update).not.toBeCalled();
    });
    it('should update community', async () => {
      const id = 1;
      const community = communityGenerator();
      const updatedCommunity = {
        ...community,
        ...changes,
      };
      jest.spyOn(repository, 'findById').mockResolvedValue(community);
      jest.spyOn(repository, 'update').mockResolvedValue(updatedCommunity);

      const result = await communityService.update(id, changes);
      expect(result).toEqual(
        plainToInstance(CommunityResponse, updatedCommunity),
      );
      expect(repository.update).toBeCalledWith(id, changes);
    });
  });
});
