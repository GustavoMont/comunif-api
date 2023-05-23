import { User } from 'src/models/User';
import { TokenDto } from '../dto/token-dto';
import { SignupDto } from '../dto/sign-up.dto';

import { ConfirmResetPasswordCodeDto } from 'src/user/dto/confirm-reset-password-code.dto';
import {
  ResetPasswordDto,
  ResetPasswordResponseDto,
} from '../dto/reset-password.dto';
import { PasswordDto } from '../dto/password.dto';
import { RequestUser } from 'src/types/RequestUser';

export abstract class IAuthService {
  abstract isPasswordEqual(password: string, confirmPassword: string): boolean;
  abstract validateUser(username: string, pass: string): Promise<any>;
  abstract login(user: User): TokenDto;
  abstract signup(body: SignupDto): Promise<TokenDto>;
  abstract resetPassword(
    body: ResetPasswordDto,
  ): Promise<ResetPasswordResponseDto>;
  abstract confirmCode(
    body: ConfirmResetPasswordCodeDto,
  ): Promise<{ access: string }>;
  abstract changePassword(
    user: RequestUser,
    password: PasswordDto,
  ): Promise<void>;
}
