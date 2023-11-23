import { Module } from '@nestjs/common';
import { PublicController } from './public.controller';
import { FileModule } from 'src/file/file.module';

@Module({
  controllers: [PublicController],
  imports: [FileModule],
})
export class PublicModule {}
