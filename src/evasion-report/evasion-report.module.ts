import { Module } from '@nestjs/common';
import { IEvasionReportRepository } from './interfaces/IEvasionReportRepository';
import { EvasionReportRepository } from './evasion-report.reporitory.service';
import { PrismaClient } from '@prisma/client';
import { EvasionReportService } from './evasion-report.service';
import { IEvasionReportService } from './interfaces/IEvasionReportService';
import { CommunityModule } from 'src/community/community.module';
import { UserModule } from 'src/user/user.module';
import { MailModule } from 'src/mail/mail.module';
import { EvasionReportController } from './evasion-report.controller';

@Module({
  providers: [
    PrismaClient,
    {
      provide: IEvasionReportRepository,
      useClass: EvasionReportRepository,
    },
    {
      provide: IEvasionReportService,
      useClass: EvasionReportService,
    },
  ],
  imports: [CommunityModule, UserModule, MailModule],
  exports: [IEvasionReportService],
  controllers: [EvasionReportController],
})
export class EvasionReportModule {}
