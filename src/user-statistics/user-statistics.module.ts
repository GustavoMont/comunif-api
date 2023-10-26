import { Module } from '@nestjs/common';
import { UserStatisticsService } from './user-statistics.service';
import { IUserStatisticsService } from './interfaces/IUserStatisticsService';
import { UserModule } from 'src/user/user.module';

@Module({
  providers: [
    {
      provide: IUserStatisticsService,
      useClass: UserStatisticsService,
    },
  ],
  imports: [UserModule],
})
export class UserStatisticsModule {}
