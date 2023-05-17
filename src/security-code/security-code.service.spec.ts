import { Test, TestingModule } from '@nestjs/testing';
import { SecurityCodeService } from './security-code.service';
import { SecurityCodeRepository } from './security-code-repository.service';
import { resetPasswordCodeGenerator } from 'src/utils/generators';
import { HttpException, HttpStatus } from '@nestjs/common';
import { afterEach } from 'node:test';
import * as moment from 'moment';
describe('SecurityCodeService', () => {
  let service: SecurityCodeService;
  let repository: SecurityCodeRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SecurityCodeService,
        {
          provide: SecurityCodeRepository,
          useValue: {
            findByCode: jest.fn(),
            createCode: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SecurityCodeService>(SecurityCodeService);
    repository = module.get<SecurityCodeRepository>(SecurityCodeRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  afterEach(() => {
    (repository.findByCode as jest.Mock).mockReset();
  });
  describe('Create code', () => {
    beforeEach(() => {
      jest.spyOn(repository, 'findByCode').mockResolvedValue(null);
      jest
        .spyOn(repository, 'createCode')
        .mockResolvedValue(resetPasswordCodeGenerator());
    });
    it('should run twice', async () => {
      jest.spyOn(repository, 'findByCode').mockResolvedValueOnce({
        code: '0001',
        expiresAt: new Date(),
        id: 1,
        userId: 1,
      });
      await service.createCode(1);
      expect(repository.findByCode).toBeCalledTimes(2);
    });
    it('should run once', async () => {
      await service.createCode(1);
      expect(repository.findByCode).toBeCalledTimes(1);
    });
  });
  describe('Find code by value', () => {
    it('should throw not found code', async () => {
      jest.spyOn(repository, 'findByCode').mockResolvedValue(null);
      await expect(service.findByCode('000001')).rejects.toThrowError(
        new HttpException('Código não encontrado', HttpStatus.NOT_FOUND),
      );
    });
    it('should throw expired code', async () => {
      jest.spyOn(repository, 'findByCode').mockResolvedValue(
        resetPasswordCodeGenerator({
          expiresAt: new Date('01-01-2001'),
        }),
      );
      await expect(service.findByCode('000001')).rejects.toThrowError(
        new HttpException('Esse código já expirou', HttpStatus.BAD_REQUEST),
      );
    });
    it('should return code', async () => {
      const code = resetPasswordCodeGenerator({
        expiresAt: moment().add(4, 'days').toDate(),
      });
      jest.spyOn(repository, 'findByCode').mockResolvedValue(code);
      const result = await service.findByCode('000001');
      expect(result).toBe(code);
    });
  });
});
