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

export class ResetPasswordResponseDto {
  constructor(hashedEmail: string) {
    this.email = hashedEmail;
  }
  email: string;
}
