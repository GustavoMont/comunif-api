import { Length } from 'class-validator';
import { PasswordDto } from 'src/auth/dto/password.dto';
import { IsNaN } from 'src/decorators/is-nan.decorator';

export class UpdatePasswordDto extends PasswordDto {
  @Length(6, 6, {
    message: 'Código inválido',
  })
  @IsNaN({
    message: 'Código inválido',
  })
  code: string;
}
