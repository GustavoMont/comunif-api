import { IsEmail } from 'class-validator';

export class ResetPasswordDto {
  @IsEmail(
    {},
    {
      message: 'Insira um e-mail válido',
    },
  )
  email: string;
}
