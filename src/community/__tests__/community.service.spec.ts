import { HttpException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { instanceToInstance, plainToInstance } from 'class-transformer';
import {
  arrayGenerator,
  communityGenerator,
  userGenerator,
} from 'src/utils/generators';
import { CommunityService } from '../community.service';
import { CommunityResponse } from '../dto/community-response.dto';
import { ICommunityRepository } from '../interfaces/ICommunityRepository';
import { Community } from '@prisma/client';
import { CommunityUpdate } from '../dto/community-update.dto';
import { ListResponse } from 'src/dtos/list.dto';
import { RoleEnum } from 'src/models/User';
import { CommunityQueryDto } from '../dto/community-query.dto';
import { IUserService } from 'src/user/interfaces/IUserService';
import { CountDto } from 'src/dtos/count.dto';
import { IFileService } from 'src/file/interfaces/IFileService';
import { fileServiceMock } from 'src/file/__mocks__/file-service.mock';

describe('Community Service', () => {
  let repository: ICommunityRepository;
  let fileService: IFileService;
  let userService: IUserService;
  let communityService: CommunityService;
  const admin = { id: 1, roles: [RoleEnum.admin], username: 'test' };
  const user = { id: 1, roles: [RoleEnum.user], username: 'test' };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommunityService,
        {
          provide: ICommunityRepository,
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
            findByChannelId: jest.fn(),
          } as ICommunityRepository,
        },
        {
          provide: IUserService,
          useValue: {
            findById: jest.fn(),
            findAll: jest.fn(),
          },
        },
        {
          provide: IFileService,
          useValue: fileServiceMock,
        },
      ],
    }).compile();
    userService = module.get<IUserService>(IUserService);
    fileService = module.get<IFileService>(IFileService);
    communityService = module.get<CommunityService>(CommunityService);
    repository = module.get<ICommunityRepository>(ICommunityRepository);
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
  describe('get community', () => {
    beforeEach(() => {
      jest.spyOn(repository, 'findUser').mockResolvedValue(userGenerator());
    });
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
        plainToInstance(CommunityResponse, { ...community, isMember: true }),
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
      jest.spyOn(repository, 'findUser').mockResolvedValue(userGenerator());
    });
    it('should return all communities when admin', async () => {
      const result = await communityService.findAll(admin, undefined, take);
      const communityWithIsMember = communities.map((community) => ({
        ...community,
        isMember: true,
      }));
      expect(result).toEqual(
        new ListResponse<Community>(communityWithIsMember, total, 1, take),
      );
      expect(repository.findAll).toBeCalledWith(undefined, take, 0);
    });
    it('should return only active when user request', async () => {
      const result = await communityService.findAll(user, undefined, take);
      const communityWithIsMember = communities.map((community) => ({
        ...community,
        isMember: true,
      }));
      expect(result).toEqual(
        new ListResponse<Community>(communityWithIsMember, total, 1, take),
      );
      expect(repository.findAll).toBeCalledWith({ isActive: true }, take, 0);
    });
    it('should return filtered communities', async () => {
      const communities = arrayGenerator<Community>(take, communityGenerator);
      jest.spyOn(repository, 'findAll').mockResolvedValue(communities);
      jest.spyOn(repository, 'count').mockResolvedValue(total);
      const result = await communityService.findAll(
        admin,
        plainToInstance(CommunityQueryDto, { isActive: 'false', name: 'sim' }),
        3,
      );
      const communityWithIsMember = communities.map((community) => ({
        ...community,
        isMember: true,
      }));
      expect(result).toEqual(
        new ListResponse<Community>(
          plainToInstance(CommunityResponse, communityWithIsMember),
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
      jest.spyOn(fileService, 'deleteFile').mockResolvedValue();

      const result = await communityService.update(id, changes);
      expect(result).toEqual(
        plainToInstance(CommunityResponse, updatedCommunity),
      );
      expect(repository.update).toBeCalledWith(id, changes);
      expect(fileService.deleteFile).toBeCalled();
    });
  });
  describe('create community', () => {
    const newCommunity = communityGenerator();
    beforeEach(() => {
      jest.spyOn(repository, 'create').mockResolvedValue(newCommunity);
      jest.spyOn(repository, 'count').mockResolvedValue(0);
      jest
        .spyOn(fileService, 'uploadFile')
        .mockResolvedValue(newCommunity.banner);
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
      expect(instanceToInstance(result)).toEqual({
        ...newCommunity,
        isMember: false,
      });
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
  describe('get community by channel id', () => {
    it('should throw community not found', async () => {
      jest.spyOn(repository, 'findByChannelId').mockResolvedValue(null);
      await expect(communityService.findByChannelId(1)).rejects.toThrowError(
        new HttpException('Comunidade não encontrada', HttpStatus.NOT_FOUND),
      );
    });
    it('should return community', async () => {
      const community = communityGenerator();
      jest.spyOn(repository, 'findByChannelId').mockResolvedValue(community);
      const result = await communityService.findByChannelId(1);
      expect(result).toStrictEqual(
        plainToInstance(CommunityResponse, community),
      );
    });
  });
  describe('count', () => {
    const total = 10;
    it('should count all communities', async () => {
      jest.spyOn(repository, 'count').mockResolvedValue(total);
      const result = await communityService.count();
      expect(result).toStrictEqual(plainToInstance(CountDto, { total }));
    });
    it('should count communities filtered', async () => {
      jest.spyOn(repository, 'count').mockResolvedValue(total);
      const expectedFilters: CommunityQueryDto = {
        isActive: true,
        name: {
          contains: 'olá',
        },
        subject: 'subjecto',
      };
      const result = await communityService.count(expectedFilters);
      expect(result).toStrictEqual(plainToInstance(CountDto, { total }));
      expect(repository.count).toBeCalledWith(expectedFilters);
    });
  });
});
