import { Module } from '@nestjs/common';
import { CommunityService } from './community.service';
import { CommunityController } from './community.controller';
import { PrismaClient } from '@prisma/client';
import { UserModule } from 'src/user/user.module';
import { CommunityRepository } from './community-repository.service';
import { ImageService } from 'src/utils/image.service';

@Module({
  imports: [UserModule],
  controllers: [CommunityController],
  providers: [
    CommunityService,
    CommunityRepository,
    PrismaClient,
    ImageService,
  ],
  exports: [CommunityService],
})
export class CommunityModule {}
