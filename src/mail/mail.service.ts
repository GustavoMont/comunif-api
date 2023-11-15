import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { IMailService } from './interfaces/IMailService';
import { User } from 'src/models/User';
import { EvasionReportResponseDto } from 'src/evasion-report/dto/evasion-report-response.dto';
import { UserResponse } from 'src/user/dto/user-response.dto';
import { IMailerService } from './interfaces/IMailerService';

@Injectable()
export class MailService implements IMailService {
  constructor(
    @Inject(IMailerService) private readonly mailer: IMailerService,
  ) {}
  async notificateBanUser(report: EvasionReportResponseDto): Promise<void> {
    try {
      const { user, community, reason } = report;
      const communityName = community.name;
      await this.mailer.sendMail({
        to: user.email,
        subject: `Oops! Algo aconteceu na comunidade ${communityName}`,
        template: './notificate-ban-user',
        context: {
          name: user.name,
          communityName,
          reason,
        },
      });
    } catch (error) {
      this.logger.error(error);

      throw new HttpException(
        'Erro ao enviar o e-mail! Por favor contate manualmente o usuário.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async notificateBanResponsible(
    { community, reason, remover, user }: EvasionReportResponseDto,
    responsable: UserResponse,
  ): Promise<void> {
    try {
      const communityName = community.name;
      await this.mailer.sendMail({
        to: user.email,
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
    } catch (error) {
      this.logger.error(error);

      throw new HttpException(
        'Erro ao enviar o e-mail! Por favor contate manualmente o usuário.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  private readonly logger = new Logger('MAIL_SERVICE');

  async userLeftCommunity(
    { community, user, reason }: EvasionReportResponseDto,
    { email: to, name: adminName }: User,
  ): Promise<void> {
    try {
      await this.mailer.sendMail({
        to,
        subject: 'Um usuário deixou uma comunidade!',
        template: './user-left-community',
        context: {
          adminName,
          communityName: community.name,
          username: user.username,
          reason,
        },
      });
    } catch (error) {
      this.logger.error(error);

      throw new HttpException(
        'Erro ao enviar o e-mail! Por favor contate manualmente o usuário.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async activateUser({ email: to, name }: User): Promise<void> {
    try {
      await this.mailer.sendMail({
        to,
        subject: 'Sua conta foi reativada!',
        template: './activate-user',
        context: {
          name,
        },
      });
    } catch (error) {
      this.logger.error(error);

      throw new HttpException(
        'Erro ao enviar o e-mail! Por favor contate manualmente o usuário.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async deactivateUser(
    { email: to, name }: User,
    reason: string,
  ): Promise<void> {
    try {
      await this.mailer.sendMail({
        to,
        subject: 'Oops! Tivemos um problema',
        template: './deactivate-user',
        context: {
          name,
          reason,
        },
      });
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(
        'Erro ao enviar o e-mail! Por favor contate manualmente o usuário, explicando o ocorrido',

        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async passwordUpdated({ email: to, name }: User): Promise<void> {
    try {
      await this.mailer.sendMail({
        to,
        subject: 'Sua senha foi redefinida',
        template: './password-updated',
        context: {
          name,
        },
      });
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(
        'Erro ao enviar o e-mail',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async resetPassword({ email: to, name }: User, code: string): Promise<void> {
    try {
      await this.mailer.sendMail({
        to,
        subject: 'Redefinição da sua senha',
        template: './reset-password',
        context: {
          name,
          code,
        },
      });
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(
        'Erro ao enviar o e-mail',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
