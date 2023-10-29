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
import { CommunityUsersModule } from './community-users/community-users.module';
import { ConfigModule } from '@nestjs/config';
import { UserStatisticsModule } from './user-statistics/user-statistics.module';
import { CommunityStatisticsModule } from './community-statistics/community-statistics.module';
import { EvasionReportModule } from './evasion-report/evasion-report.module';

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
    CommunityUsersModule,
    ConfigModule.forRoot(),
    UserStatisticsModule,
    UserStatisticsModule,
    CommunityStatisticsModule,
    EvasionReportModule,
  ],
  controllers: [PublicController],
})
export class AppModule {}
