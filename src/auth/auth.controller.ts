import {
  Body,
  Controller,
  HttpCode,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/sign-up.dto';
import { TokenDto } from './dto/token-dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import {
  ResetPasswordDto,
  ResetPasswordResponseDto,
} from './dto/reset-password.dto';
import { ConfirmCodeResponse } from './dto/confirm-code-response.dto';
import { ConfirmResetPasswordCodeDto } from 'src/user/dto/confirm-reset-password-code.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { User } from 'src/decorators/request-user.decorator';
import { RequestUser } from 'src/types/RequestUser';
import { PasswordDto } from './dto/password.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { AccessToken } from 'src/decorators/authorization-headers.decorator';

@Controller('api/auth')
export class AuthController {
  constructor(private service: AuthService) {}
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Req() req): Promise<TokenDto> {
    return await this.service.login(req.user);
  }
  @Post('signup')
  async signup(@Body() body: SignupDto): Promise<TokenDto> {
    return await this.service.signup(body);
  }

  @HttpCode(200)
  @Post('refresh-token')
  async refreshToken(
    @Body() body: RefreshTokenDto,
    @AccessToken() accessToken: string,
  ): Promise<TokenDto> {
    return await this.service.refreshToken(body, accessToken);
  }

  @Post('reset-password')
  async resetPassword(
    @Body() body: ResetPasswordDto,
  ): Promise<ResetPasswordResponseDto> {
    return await this.service.resetPassword(body);
  }
  @Post('reset-password/confirm-code')
  @HttpCode(200)
  async confirmCode(
    @Body() body: ConfirmResetPasswordCodeDto,
  ): Promise<ConfirmCodeResponse> {
    return await this.service.confirmCode(body);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('change-password')
  @HttpCode(204)
  async changePassword(
    @User() user: RequestUser,
    @Body() body: PasswordDto,
  ): Promise<void> {
    return await this.service.changePassword(user, body);
  }
}
