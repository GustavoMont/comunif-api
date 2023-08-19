import { Test, TestingModule } from '@nestjs/testing';
import { MessageService } from '../message.service';
import { arrayGenerator, messageGenerator } from 'src/utils/generators';
import { plainToInstance } from 'class-transformer';
import { MessageResponse } from '../dtos/message-response.dto';
import { IMessageRepository } from '../interfaces/IMessageRepository';
import { Message } from 'src/models/Message';
import { ListResponse } from 'src/dtos/list.dto';

describe('MessageService', () => {
  let service: MessageService;
  let messageRepository: IMessageRepository;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessageService,
        {
          provide: IMessageRepository,
          useValue: {
            create: jest.fn(),
            findById: jest.fn(),
            findByChannelId: jest.fn(),
            countChannelMessages: jest.fn(),
          } as IMessageRepository,
        },
      ],
    }).compile();

    service = module.get<MessageService>(MessageService);
    messageRepository = module.get<IMessageRepository>(IMessageRepository);
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
      jest
        .spyOn(messageRepository, 'countChannelMessages')
        .mockResolvedValue(total);
    });
    it('should list first 50 channel messages', async () => {
      const messages = arrayGenerator<Message>(10, messageGenerator);
      jest
        .spyOn(messageRepository, 'findByChannelId')
        .mockResolvedValue(messages);
      const messagesResponse = plainToInstance(MessageResponse, messages);
      const result = await service.findByChannelId(1);
      expect(result).toStrictEqual(
        new ListResponse<MessageResponse>(messagesResponse, total, 1, 50),
      );
      expect(messageRepository.findByChannelId).toBeCalledWith(1, {
        skip: 0,
        take: 50,
      });
    });
    it('should list just 5 channel messages', async () => {
      const messages = arrayGenerator<Message>(5, messageGenerator);
      jest
        .spyOn(messageRepository, 'findByChannelId')
        .mockResolvedValue(arrayGenerator<Message>(5, messageGenerator));
      const messagesResponse = plainToInstance(MessageResponse, messages);
      const result = await service.findByChannelId(1, 1, 5);
      expect(result).toStrictEqual(
        new ListResponse<MessageResponse>(messagesResponse, total, 1, 5),
      );
      expect(messageRepository.findByChannelId).toBeCalledWith(1, {
        skip: 0,
        take: 5,
      });
    });
  });
});
