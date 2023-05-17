import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { PublicController } from './public/public.controller';
import { CommunityModule } from './community/community.module';
import { MessageModule } from './message/message.module';
import { EmailModule } from './email/email.module';
import { MailModule } from './mail/mail.module';
import { SecurityCodeModule } from './security-code/security-code.module';
import { SecurityCodeRepositoryService } from './security-code/security-code-repository.service';

@Module({
  imports: [
    UserModule,
    AuthModule,
    MulterModule.register({
      storage: memoryStorage(),
    }),
    CommunityModule,
    MessageModule,
    EmailModule,
    MailModule,
    SecurityCodeModule,
  ],
  controllers: [PublicController],
  providers: [SecurityCodeRepositoryService],
})
export class AppModule {}
