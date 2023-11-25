import { Test, TestingModule } from '@nestjs/testing';
import { MessageService } from '../message.service';
import {
  arrayGenerator,
  communityGenerator,
  messageGenerator,
  requestUserGenerator,
} from 'src/utils/generators';
import { plainToInstance } from 'class-transformer';
import { MessageResponse } from '../dtos/message-response.dto';
import { IMessageRepository } from '../interfaces/IMessageRepository';
import { Message } from 'src/models/Message';
import { ListResponse } from 'src/dtos/list.dto';
import { ICommunityUsersService } from 'src/community-users/interfaces/ICommunityUsersService';
import { ICommunityService } from 'src/community/interfaces/ICommunityService';
import { HttpException, HttpStatus } from '@nestjs/common';
import { CommunityResponse } from 'src/community/dto/community-response.dto';
import { messageRepositoryMock } from '../__mocks__/message-repository.mock';
import { MessageQueryDto } from '../dtos/message-query.dto';

describe('MessageService', () => {
  let service: MessageService;
  let communityUserService: ICommunityUsersService;
  let communityService: ICommunityService;
  let messageRepository: IMessageRepository;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessageService,
        {
          provide: IMessageRepository,
          useValue: messageRepositoryMock,
        },
        {
          provide: ICommunityUsersService,
          useValue: {
            isUserInCommunity: jest.fn(),
          } as Partial<ICommunityUsersService>,
        },
        {
          provide: ICommunityService,
          useValue: {
            findByChannelId: jest.fn(),
          } as Partial<ICommunityService>,
        },
      ],
    }).compile();

    service = module.get<MessageService>(MessageService);
    messageRepository = module.get<IMessageRepository>(IMessageRepository);
    communityUserService = module.get<ICommunityUsersService>(
      ICommunityUsersService,
    );
    communityService = module.get<ICommunityService>(ICommunityService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  describe('create', () => {
    it('should create message', async () => {
      const messageData = {
        communityChannelId: 1,
        content: 'message',
        userId: 1,
      };
      const message = messageGenerator(messageData);
      jest.spyOn(messageRepository, 'create').mockResolvedValue(message);
      const result = await service.create(messageData);
      expect(result).toStrictEqual(plainToInstance(MessageResponse, message));
    });
  });
  describe('findByChannelId', () => {
    const total = 100;
    beforeEach(() => {
      jest.spyOn(messageRepository, 'count').mockResolvedValue(total);
    });
    it('should throw forbidden', async () => {
      const community = plainToInstance(
        CommunityResponse,
        communityGenerator(),
      );
      jest
        .spyOn(communityService, 'findByChannelId')
        .mockResolvedValue(community);
      jest
        .spyOn(communityUserService, 'isUserInCommunity')
        .mockResolvedValueOnce(false);
      const user = requestUserGenerator();
      await expect(service.findByChannelId(1, user)).rejects.toThrowError(
        new HttpException(
          'Você não pode mandar mensagem pra essa comunidade',
          HttpStatus.FORBIDDEN,
        ),
      );
    });
    it('should list first 50 channel messages', async () => {
      const messages = arrayGenerator<Message>(10, messageGenerator);
      jest
        .spyOn(messageRepository, 'findByChannelId')
        .mockResolvedValue(messages);
      const messagesResponse = plainToInstance(MessageResponse, messages);
      const result = await service.findByChannelId(1, 'socket');
      expect(result).toStrictEqual(
        new ListResponse<MessageResponse>(messagesResponse, total, 1, 50),
      );
      expect(messageRepository.findByChannelId).toBeCalledWith(1, {
        skip: 0,
        take: 50,
      });
      expect(messageRepository.count).toBeCalledWith({ communityChannelId: 1 });
    });
    it('should list just 5 channel messages', async () => {
      const messages = arrayGenerator<Message>(5, messageGenerator);
      jest
        .spyOn(messageRepository, 'findByChannelId')
        .mockResolvedValue(arrayGenerator<Message>(5, messageGenerator));
      const messagesResponse = plainToInstance(MessageResponse, messages);
      const result = await service.findByChannelId(1, 'socket', 1, 5);
      expect(result).toStrictEqual(
        new ListResponse<MessageResponse>(messagesResponse, total, 1, 5),
      );
      expect(messageRepository.findByChannelId).toBeCalledWith(1, {
        skip: 0,
        take: 5,
      });
      expect(messageRepository.count).toBeCalledWith({ communityChannelId: 1 });
    });
  });
  describe('count', () => {
    const total = 50;
    beforeEach(() => {
      jest.spyOn(messageRepository, 'count').mockResolvedValue(total);
    });
    afterEach(jest.clearAllMocks);
    it('should return quantity with filtered', async () => {
      const filters: MessageQueryDto = {
        communityChannelId: 1,
        from: new Date(),
        to: new Date(),
        userId: 1,
      };
      const result = await service.countMessages(filters);
      expect(result).toBe(total);
      expect(messageRepository.count).toBeCalledWith(filters);
    });
    it('should be called without filters', async () => {
      const result = await service.countMessages();
      expect(result).toBe(total);
      expect(messageRepository.count).toBeCalledWith({});
    });
  });
});
