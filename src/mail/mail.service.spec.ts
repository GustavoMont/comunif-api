import { Test, TestingModule } from '@nestjs/testing';
import { MailService } from './mail.service';
import { MailerService } from '@nestjs-modules/mailer';
import { userGenerator } from 'src/utils/generators';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('MailService', () => {
  let service: MailService;
  let mailer: MailerService;
  const user = userGenerator({ name: 'reseter' });

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
  beforeEach(() => {
    jest.spyOn(mailer, 'sendMail').mockResolvedValue(true);
  });
  describe('Reset password', () => {
    const code = '123456';
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
  describe('Password Updated', () => {
    it('should throw error', async () => {
      jest.spyOn(mailer, 'sendMail').mockRejectedValueOnce('ocorreu um erro');
      await expect(service.passwordUpdated(user)).rejects.toThrowError(
        new HttpException(
          'Erro ao enviar o e-mail',
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );
    });
    it('should send password updated email', async () => {
      await service.passwordUpdated(user);
      expect(mailer.sendMail).toBeCalledWith({
        to: user.email,
        subject: 'Sua senha foi redefinida',
        template: './password-updated',
        context: {
          name: user.name,
        },
      });
    });
  });
  describe('Deactivate user', () => {
    const reason = 'você foi banido bro';
    it('should throw error', async () => {
      jest.spyOn(mailer, 'sendMail').mockRejectedValueOnce('ocorreu um erro');
      await expect(service.deactivateUser(user, reason)).rejects.toThrowError(
        new HttpException(
          'Erro ao enviar o e-mail! Por favor contate manualmente o usuário, explicando o ocorrido',
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );
    });
    it('shoudl send e-mail to user', async () => {
      await service.deactivateUser(user, reason);
      expect(mailer.sendMail).toBeCalledWith({
        to: user.email,
        subject: 'Oops! Tivemos um problema',
        template: './deactivate-user',
        context: {
          name: user.name,
          reason,
        },
      });
    });
  });
  describe('Activate user', () => {
    it('should throw error', async () => {
      jest.spyOn(mailer, 'sendMail').mockRejectedValueOnce('ocorreu um erro');
      await expect(service.activateUser(user)).rejects.toThrowError(
        new HttpException(
          'Erro ao enviar o e-mail! Por favor contate manualmente o usuário.',
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );
    });
    it('should send activate e-mail', async () => {
      await service.activateUser(user);
      expect(mailer.sendMail).toBeCalledWith({
        to: user.email,
        subject: 'Sua conta foi reativada!',
        template: './activate-user',
        context: {
          name: user.name,
        },
      });
    });
  });
});
