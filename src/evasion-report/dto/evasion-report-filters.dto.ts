import { IsNumber, IsOptional } from 'class-validator';

export class EvasionReportFiltersDto {
  @IsOptional()
  @IsNumber()
  community?: number;
  @IsOptional()
  @IsNumber()
  user?: number;
}
