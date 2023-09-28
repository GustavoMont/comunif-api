import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { resolve } from 'path';
import { emailConfig } from 'src/config/enviroment';
import { IMailService } from './interfaces/IMailService';

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: 'smtp.ethereal.email',
        secure: false,
        port: +emailConfig.port,
        auth: {
          user: emailConfig.email,
          pass: emailConfig.password,
        },
      },
      template: {
        dir: resolve(__dirname, 'templates'),
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
  ],
  providers: [
    {
      provide: IMailService,
      useClass: MailService,
    },
  ],
  exports: [IMailService],
})
export class MailModule {}
