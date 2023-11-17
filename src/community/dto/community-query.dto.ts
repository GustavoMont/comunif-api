import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class CommunityQueryDto {
  @IsOptional()
  @IsNotEmpty()
  @Transform(({ value }) =>
    value !== 'true' && value !== 'false' ? undefined : value === 'true',
  )
  isActive?: boolean;
  @IsOptional()
  @Transform(({ value: name }) => ({ contains: name }))
  name?: {
    contains: string;
  };
  @Transform(({ value }) => (value as string).toLowerCase())
  subject?: string;
}
