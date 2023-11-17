import { Test, TestingModule } from '@nestjs/testing';
import { MailService } from './mail.service';
import { evasionReportGenerator, userGenerator } from 'src/utils/generators';
import { HttpException, HttpStatus } from '@nestjs/common';
import { RoleEnum } from 'src/models/User';
import { plainToInstance } from 'class-transformer';
import { EvasionReportResponseDto } from 'src/evasion-report/dto/evasion-report-response.dto';
import { UserResponse } from 'src/user/dto/user-response.dto';
import { IMailerService } from './interfaces/IMailerService';

describe('MailService', () => {
  let service: MailService;
  let mailer: IMailerService;
  const user = userGenerator({ name: 'reseter' });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: IMailerService,
          useValue: {
            sendMail: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<MailService>(MailService);
    mailer = module.get<IMailerService>(IMailerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  afterEach(() => {
    jest.spyOn(mailer, 'sendMail').mockReset();
  });
  beforeEach(() => {
    jest.spyOn(mailer, 'sendMail').mockResolvedValue();
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
  describe('User left community', () => {
    const evasionReport = plainToInstance(
      EvasionReportResponseDto,
      evasionReportGenerator(),
    );
    const admin = userGenerator({ role: RoleEnum.admin });
    it('should throw error', async () => {
      jest.spyOn(mailer, 'sendMail').mockRejectedValueOnce('ocorreu um erro');
      await expect(
        service.userLeftCommunity(evasionReport, admin),
      ).rejects.toThrowError(
        new HttpException(
          'Erro ao enviar o e-mail! Por favor contate manualmente o usuário.',
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );
    });
    it('should send activate e-mail', async () => {
      await service.userLeftCommunity(evasionReport, admin);
      expect(mailer.sendMail).toBeCalledWith({
        to: user.email,
        subject: 'Um usuário deixou uma comunidade!',
        template: './user-left-community',
        context: {
          adminName: admin.name,
          communityName: evasionReport.community.name,
          username: evasionReport.user.username,
          reason: evasionReport.reason,
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
  describe('Notifcate user banned', () => {
    const evasionReport = plainToInstance(
      EvasionReportResponseDto,
      evasionReportGenerator(),
    );
    it('should throw error', async () => {
      jest.spyOn(mailer, 'sendMail').mockRejectedValueOnce('ocorreu um erro');
      await expect(
        service.notificateBanUser(evasionReport),
      ).rejects.toThrowError(
        new HttpException(
          'Erro ao enviar o e-mail! Por favor contate manualmente o usuário.',
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );
    });
    it('should send activate e-mail', async () => {
      const { community, reason, user } = evasionReport;
      const communityName = community.name;
      await service.notificateBanUser(evasionReport);
      expect(mailer.sendMail).toBeCalledWith({
        to: evasionReport.user.email,
        subject: `Oops! Algo aconteceu na comunidade ${communityName}`,
        template: './notificate-ban-user',
        context: {
          name: user.name,
          communityName,
          reason,
        },
      });
    });
  });
  describe('Notificate admin of user banned', () => {
    const evasionReport = plainToInstance(
      EvasionReportResponseDto,
      evasionReportGenerator(),
    );
    const responsable = plainToInstance(
      UserResponse,
      userGenerator({ role: RoleEnum.admin }),
    );
    it('should throw error', async () => {
      jest.spyOn(mailer, 'sendMail').mockRejectedValueOnce('ocorreu um erro');
      await expect(
        service.notificateBanResponsible(evasionReport, responsable),
      ).rejects.toThrowError(
        new HttpException(
          'Erro ao enviar o e-mail! Por favor contate manualmente o usuário.',
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );
    });
    it('should send activate e-mail', async () => {
      const { community, reason, user, remover } = evasionReport;
      const communityName = community.name;
      await service.notificateBanResponsible(evasionReport, responsable);
      expect(mailer.sendMail).toBeCalledWith({
        to: evasionReport.user.email,
        subject: `Oops! Algo aconteceu na comunidade ${communityName}`,
        template: './notificate-admin-ban',
        context: {
          username: user.username,
          communityName,
          adminName: responsable.name,
          reason,
          adminUsername: remover.username,
        },
      });
    });
  });
});
