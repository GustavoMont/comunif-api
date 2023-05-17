import { Test, TestingModule } from '@nestjs/testing';
import { SecurityCodeService } from './security-code.service';
import { SecurityCodeRepository } from './security-code-repository.service';
import { resetPasswordCodeGenerator } from 'src/utils/generators';
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
});