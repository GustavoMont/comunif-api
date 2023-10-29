import { IsNumber, MinLength } from 'class-validator';
import { EvasionReport } from 'src/models/EvasionReport';

type CreateEvasionType = Pick<
  EvasionReport,
  'communityId' | 'reason' | 'userId' | 'removerId'
>;

export class CreateAdminEvasionReportDto implements CreateEvasionType {
  @IsNumber()
  removerId: number;
  @IsNumber()
  communityId: number;
  @MinLength(10, { message: 'Deve ter no mínimo 10 caracteres' })
  reason: string;
  @IsNumber()
  userId: number;
}
