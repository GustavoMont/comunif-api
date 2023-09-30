import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class UserQueryDto {
  @IsOptional()
  @IsNotEmpty()
  @Transform(({ value }) =>
    value !== 'true' && value !== 'false' ? undefined : value === 'true',
  )
  isActive: boolean;
}
