import { Module } from '@nestjs/common';
import { ICommunityUsersRepostory } from './interfaces/ICommunityUserRepository';
import { CommunityUsersService } from './community-users.service';
import { CommunityUsersRepository } from './community-users.repository.service';
import { UserModule } from 'src/user/user.module';
import { CommunityModule } from 'src/community/community.module';
import { ICommunityUsersService } from './interfaces/ICommunityUsersService';
import { PrismaClient } from '@prisma/client';
import { CommunityUsersController } from './community-users.controller';
import { EvasionReportModule } from 'src/evasion-report/evasion-report.module';
import { MailModule } from 'src/mail/mail.module';
@Module({
  imports: [UserModule, CommunityModule, EvasionReportModule, MailModule],
  providers: [
    {
      provide: ICommunityUsersService,
      useClass: CommunityUsersService,
    },
    {
      provide: ICommunityUsersRepostory,
      useClass: CommunityUsersRepository,
    },
    PrismaClient,
  ],
  controllers: [CommunityUsersController],
  exports: [ICommunityUsersService],
})
export class CommunityUsersModule {}
