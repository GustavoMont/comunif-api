import { Module } from '@nestjs/common';
import { CommunityService } from './community.service';
import { CommunityController } from './community.controller';
import { PrismaClient } from '@prisma/client';
import { UserModule } from 'src/user/user.module';
import { CommunityRepository } from './community-repository.service';
import { ImageService } from 'src/utils/image.service';
import { ICommunityRepository } from './interfaces/ICommunityRepository';
import { ICommunityService } from './interfaces/ICommunityService';
import { FileModule } from 'src/file/file.module';

@Module({
  imports: [UserModule, FileModule],
  controllers: [CommunityController],
  providers: [
    {
      provide: ICommunityService,
      useClass: CommunityService,
    },
    {
      provide: ICommunityRepository,
      useClass: CommunityRepository,
    },
    PrismaClient,
    ImageService,
  ],
  exports: [ICommunityService],
})
export class CommunityModule {}
