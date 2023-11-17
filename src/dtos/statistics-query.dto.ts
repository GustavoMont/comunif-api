import { Transform } from 'class-transformer';
import { IsDate, IsOptional } from 'class-validator';

export class StatisticsQueryDto {
  @IsOptional()
  @IsDate()
  @Transform(({ value }) => (value ? new Date(value) : undefined))
  from?: Date;
  @IsOptional()
  @Transform(({ value }) => (value ? new Date(value) : undefined))
  to?: Date;
}
