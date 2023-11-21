import { IsNotEmpty, Length } from 'class-validator';
import { IsNaN } from 'src/decorators/is-nan.decorator';

export class ConfirmResetPasswordCodeDto {
  @Length(6, 6, {
    message: 'Código inválido',
  })
  @IsNotEmpty()
  @IsNaN({
    message: 'Código inválido',
  })
  code: string;
  @IsNotEmpty()
  email: string;
}
