import { Test, TestingModule } from '@nestjs/testing';
import { MailService } from './mail.service';
import { MailerService } from '@nestjs-modules/mailer';
import { userGenerator } from 'src/utils/generators';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('MailService', () => {
  let service: MailService;
  let mailer: MailerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: MailerService,
          useValue: {
            sendMail: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<MailService>(MailService);
    mailer = module.get<MailerService>(MailerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  afterEach(() => {
    jest.spyOn(mailer, 'sendMail').mockReset();
  });
  describe('Reset password', () => {
    const user = userGenerator({ name: 'reseter' });
    const code = '123456';
    beforeEach(() => {
      jest.spyOn(mailer, 'sendMail').mockResolvedValue(true);
    });
    it('should throw error', async () => {
      jest.spyOn(mailer, 'sendMail').mockRejectedValueOnce('ocorreu um erro');
      await expect(service.resetPassword(user, code)).rejects.toThrowError(
        new HttpException(
          'Erro ao enviar o e-mail',
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );
    });
    it('should send email correctly', async () => {
      await service.resetPassword(user, code);
      expect(mailer.sendMail).toBeCalledWith({
        to: user.email,
        subject: 'Redefinição da sua senha',
        template: './reset-password',
        context: {
          name: user.name,
          code,
        },
      });
    });
  });
});
