import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty } from 'class-validator';
import { MinAge } from 'src/decorators/min-age.decorator';
import { PasswordDto } from './password.dto';

export class SignupDto extends PasswordDto {
  @IsNotEmpty({ message: 'Nome é um campo obrigatório' })
  name: string;

  @IsNotEmpty({ message: 'Sobrenomeome é um campo obrigatório' })
  lastName: string;

  @IsEmail({}, { message: 'Informe um e-mail válido' })
  email: string;

  @IsNotEmpty({ message: 'username é um campo obrigatório' })
  username: string;

  @MinAge({
    message: 'Idade mínima de 15 anos',
  })
  @Transform(({ value }) => new Date(value).toISOString())
  birthday: Date;
}
