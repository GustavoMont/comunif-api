import { Length } from 'class-validator';
import { IsNaN } from 'src/decorators/is-nan.decorator';

export class ConfirmResetPasswordCodeDto {
  @Length(6, 6, {
    message: 'Código inválido',
  })
  @IsNaN({
    message: 'Código inválido',
  })
  code: string;
  email: string;
}
