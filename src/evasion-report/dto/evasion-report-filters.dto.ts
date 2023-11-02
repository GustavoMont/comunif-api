import { Type } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';

export class EvasionReportFiltersDto {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  community?: number;
  @IsOptional()
  user?: number;
}
