import { IsNumber, IsOptional, MinLength } from 'class-validator';
import { EvasionReport } from 'src/models/EvasionReport';

type CreateEvasionType = Pick<
  EvasionReport,
  'communityId' | 'reason' | 'userId'
>;

export class CreateUserEvasionReportDto implements CreateEvasionType {
  @IsNumber({}, { message: 'Inform uma comunidade válida' })
  communityId: number;
  @IsOptional()
  @MinLength(10, { message: 'Deve ter no mínimo 10 caracteres' })
  reason: string;
  @IsNumber({}, { message: 'Informe um usuário válido' })
  userId: number;
}
