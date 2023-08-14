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
import { RefreshTokenDto } from '../dto/refresh-token.dto';

export interface IAuthService {
  isPasswordEqual(password: string, confirmPassword: string): boolean;
  validateUser(username: string, pass: string): Promise<any>;
  login(user: User): Promise<TokenDto>;
  signup(body: SignupDto): Promise<TokenDto>;
  resetPassword(body: ResetPasswordDto): Promise<ResetPasswordResponseDto>;
  confirmCode(body: ConfirmResetPasswordCodeDto): Promise<{ access: string }>;
  changePassword(user: RequestUser, password: PasswordDto): Promise<void>;
  refreshToken(body: RefreshTokenDto, accessToken: string): Promise<TokenDto>;
}
