import { IsOptional, Matches } from 'class-validator';

export class PasswordDto {
  @Matches(/^(?=.*[A-Za-z])(?=.*?[0-9]).{8,}$/, {
    message:
      'A senha deve ter no mínimo 8 caracteres, conter uma letra e um número',
  })
  password: string;
  @IsOptional()
  confirmPassword: string;
}
