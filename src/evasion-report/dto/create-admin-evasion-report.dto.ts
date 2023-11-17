import { IsNumber, MinLength } from 'class-validator';
import { EvasionReport } from 'src/models/EvasionReport';

type CreateEvasionType = Pick<
  EvasionReport,
  'communityId' | 'reason' | 'userId' | 'removerId'
>;

export class CreateAdminEvasionReportDto implements CreateEvasionType {
  @IsNumber({}, { message: 'Necessário informar quem está removendo' })
  removerId: number;
  @IsNumber({}, { message: 'Necessário informar a comunidade' })
  communityId: number;
  @MinLength(10, { message: 'Deve ter no mínimo 10 caracteres' })
  reason: string;
  @IsNumber(
    {},
    { message: 'Necessário informar o usuário que está sendo removido' },
  )
  userId: number;
}
