import { Transform } from 'class-transformer';
import { IsDate, IsNumber, IsOptional } from 'class-validator';

export class MessageQueryDto {
  @IsOptional()
  @IsNumber()
  communityChannelId?: number;

  @IsOptional()
  @IsDate()
  @Transform(({ value }) => (value ? new Date(value) : undefined))
  from?: Date;

  @IsOptional()
  @Transform(({ value }) => (value ? new Date(value) : undefined))
  to?: Date;

  @IsOptional()
  @IsNumber()
  userId?: number;
}
