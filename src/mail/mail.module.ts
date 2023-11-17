import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { IMailService } from './interfaces/IMailService';
import { IMailerService } from './interfaces/IMailerService';
import { MailerService } from './mailer.service';

@Module({
  providers: [
    {
      provide: IMailService,
      useClass: MailService,
    },
    {
      provide: IMailerService,
      useClass: MailerService,
    },
  ],
  exports: [IMailService],
})
export class MailModule {}
