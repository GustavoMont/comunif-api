import { HttpException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { instanceToInstance, plainToInstance } from 'class-transformer';
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
import { ListResponse } from 'src/dtos/list.dto';
import { RoleEnum } from 'src/models/User';
import { CommunityQueryDto } from '../dto/community-query.dto';
import { ImageService } from 'src/utils/image.service';
import { UserService } from 'src/user/user.service';

describe('Community Service', () => {
  let repository: CommunityRepository;
  let imageService: ImageService;
  let userService: UserService;
  let communityService: CommunityService;
  const admin = { id: 1, roles: [RoleEnum.admin], username: 'test' };
  const user = { id: 1, roles: [RoleEnum.user], username: 'test' };

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
            count: jest.fn(),
            create: jest.fn(),
            delete: jest.fn(),
          } as ICommunityRepository,
        },
        {
          provide: UserService,
          useValue: {
            findById: jest.fn(),
            findAll: jest.fn(),
          },
        },
        {
          provide: ImageService,
          useValue: {
            deleteImage: jest.fn(),
          },
        },
      ],
    }).compile();
    userService = module.get<UserService>(UserService);
    imageService = module.get<ImageService>(ImageService);
    communityService = module.get<CommunityService>(CommunityService);
    repository = module.get<CommunityRepository>(CommunityRepository);
  });
  afterEach(() => {
    Object.keys(repository).forEach((key) => {
      jest.spyOn(repository, key as keyof ICommunityRepository).mockReset();
    });
  });
  it('should be defined', () => {
    expect(communityService).toBeDefined();
    expect(repository).toBeDefined();
  });
  describe('Add User on community', () => {
    it('should throw user not found exception', async () => {
      //Arrange
      jest.spyOn(userService, 'findById').mockResolvedValue(null);
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
      jest.spyOn(userService, 'findById').mockResolvedValue(userGenerator());
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
      jest.spyOn(userService, 'findById').mockResolvedValue(userGenerator());
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
      jest.spyOn(userService, 'findById').mockResolvedValue(userGenerator());
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
      jest.spyOn(userService, 'findById').mockResolvedValue(null);

      await expect(
        communityService.findUserCommunities(1),
      ).rejects.toThrowError(
        new HttpException('Usuário não encontrado', HttpStatus.BAD_REQUEST),
      );
      expect(repository.findUserCommunities).not.toBeCalled();
    });
    it('should return all user communities', async () => {
      jest.spyOn(userService, 'findById').mockResolvedValue(userGenerator());
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
    const take = 3;
    const total = 6;
    const communities = arrayGenerator<Community>(take, communityGenerator);

    beforeEach(() => {
      jest.spyOn(repository, 'count').mockResolvedValue(total);
      jest.spyOn(repository, 'findAll').mockResolvedValue(communities);
    });
    it('should return all communities when admin', async () => {
      const result = await communityService.findAll(admin, undefined, take);
      expect(result).toEqual(
        new ListResponse<Community>(communities, total, 1, take),
      );
      expect(repository.findAll).toBeCalledWith(undefined, take, 0);
    });
    it('should return only active when user request', async () => {
      const result = await communityService.findAll(user, undefined, take);
      expect(result).toEqual(
        new ListResponse<Community>(communities, total, 1, take),
      );
      expect(repository.findAll).toBeCalledWith({ isActive: true }, take, 0);
    });
    it('should return filtered communities', async () => {
      const communities = arrayGenerator<Community>(take, communityGenerator);
      jest.spyOn(repository, 'findAll').mockResolvedValue(communities);
      jest.spyOn(repository, 'count').mockResolvedValue(total);
      const result = await communityService.findAll(
        admin,
        plainToInstance(CommunityQueryDto, { isActive: false, name: 'sim' }),
        3,
      );
      expect(result).toEqual(
        new ListResponse<Community>(
          plainToInstance(CommunityResponse, communities),
          total,
          1,
          take,
        ),
      );
      expect(repository.findAll).toBeCalledWith(
        { isActive: false, name: { contains: 'sim' } },
        take,
        0,
      );
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
      jest.spyOn(imageService, 'deleteImage').mockResolvedValue();

      const result = await communityService.update(id, changes);
      expect(result).toEqual(
        plainToInstance(CommunityResponse, updatedCommunity),
      );
      expect(repository.update).toBeCalledWith(id, changes);
      expect(imageService.deleteImage).toBeCalled();
    });
  });
  describe('create community', () => {
    const newCommunity = communityGenerator();
    beforeEach(() => {
      jest.spyOn(repository, 'create').mockResolvedValue(newCommunity);
      jest.spyOn(repository, 'count').mockResolvedValue(0);
    });
    it('should throw a forbidden', async () => {
      await expect(
        communityService.create(user, newCommunity),
      ).rejects.toThrowError(
        new HttpException(
          'Você não tem permissão para executar essa ação',
          HttpStatus.FORBIDDEN,
        ),
      );
      expect(repository.count).not.toBeCalled();
      expect(repository.create).not.toBeCalled();
    });
    it('should throw a community already has this subject', async () => {
      jest.spyOn(repository, 'count').mockReset().mockResolvedValue(1);
      await expect(
        communityService.create(admin, newCommunity),
      ).rejects.toThrowError(
        new HttpException(
          'Já existe uma comunidade com esse assunto',
          HttpStatus.BAD_REQUEST,
        ),
      );
      expect(repository.count).toBeCalledWith({
        subject: newCommunity.subject,
      });
    });
    it('should create communities', async () => {
      const result = await communityService.create(admin, newCommunity);
      expect(instanceToInstance(result)).toEqual(newCommunity);
    });
  });
  describe('delete community', () => {
    beforeEach(() => {
      jest
        .spyOn(repository, 'findById')
        .mockResolvedValue(communityGenerator());
      jest.spyOn(repository, 'delete').mockResolvedValue(null);
    });
    it('should throw forbidden', async () => {
      await expect(communityService.delete(user, 1)).rejects.toThrowError(
        new HttpException(
          'Você não tem permissão para executar essa ação',
          HttpStatus.FORBIDDEN,
        ),
      );
      expect(repository.findById).not.toBeCalled();
      expect(repository.delete).not.toBeCalled();
    });
    it('should throw not found', async () => {
      jest.spyOn(repository, 'findById').mockReset().mockResolvedValue(null);
      await expect(communityService.delete(admin, 1)).rejects.toThrowError(
        new HttpException('Comunidade não encontrada', HttpStatus.NOT_FOUND),
      );
      expect(repository.findById).toBeCalledWith(1);
      expect(repository.delete).not.toBeCalled();
    });
    it('should delete community', async () => {
      await communityService.delete(admin, 1);
      expect(repository.findById).toBeCalledWith(1);
      expect(repository.delete).toBeCalledWith(1);
    });
  });
});
