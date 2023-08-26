import { Module } from '@nestjs/common';
import { ICommunityUsersRepostory } from './interfaces/ICommunityUserRepository';
import { CommunityUsersService } from './community-users.service';
import { CommunityUsersRepository } from './community-users.reporitoy.service';
import { UserModule } from 'src/user/user.module';
import { CommunityModule } from 'src/community/community.module';
import { ICommunityUsersService } from './interfaces/ICommunityUsersService';
import { PrismaClient } from '@prisma/client';
import { CommunityUsersController } from './community-users.controller';
@Module({
  imports: [UserModule, CommunityModule],
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
})
export class CommunityUsersModule {}
