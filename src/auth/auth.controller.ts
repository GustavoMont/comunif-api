import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
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

@Controller('api/auth')
export class AuthController {
  constructor(private service: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(@Request() req): TokenDto {
    return this.service.login(req.user);
  }
  @Post('signup')
  async signup(@Body() body: SignupDto): Promise<TokenDto> {
    return await this.service.signup(body);
  }

  @Post('reset-password')
  async resetPassword(
    @Body() body: ResetPasswordDto,
  ): Promise<ResetPasswordResponseDto> {
    return await this.service.resetPassword(body);
  }
  @Post('reset-password/confirm-code')
  async confirmCode(
    @Body() body: ConfirmResetPasswordCodeDto,
  ): Promise<ConfirmCodeResponse> {
    return await this.service.confirmCode(body);
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  async changePassword(
    @User() user: RequestUser,
    @Body() body: PasswordDto,
  ): Promise<void> {
    return await this.service.changePassword(user, body);
  }
}
