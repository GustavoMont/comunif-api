import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { PublicController } from './public/public.controller';
import { CommunityModule } from './community/community.module';
import { MessageModule } from './message/message.module';
import { MailModule } from './mail/mail.module';
import { SecurityCodeModule } from './security-code/security-code.module';

@Module({
  imports: [
    UserModule,
    AuthModule,
    MulterModule.register({
      storage: memoryStorage(),
    }),
    CommunityModule,
    MessageModule,
    MailModule,
    SecurityCodeModule,
  ],
  controllers: [PublicController],
})
export class AppModule {}
