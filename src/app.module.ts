import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { PublicController } from './public/public.controller';
import { CommunityModule } from './community/community.module';
import { MessageModule } from './message/message.module';

@Module({
  imports: [
    UserModule,
    AuthModule,
    MulterModule.register({
      storage: memoryStorage(),
    }),
    CommunityModule,
    MessageModule,
  ],
  controllers: [PublicController],
})
export class AppModule {}
