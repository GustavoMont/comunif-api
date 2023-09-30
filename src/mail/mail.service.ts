import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { IMailService } from './interfaces/IMailService';
import { User } from 'src/models/User';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService implements IMailService {
  constructor(private readonly mailer: MailerService) {}
  private readonly logger = new Logger('mail');
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
