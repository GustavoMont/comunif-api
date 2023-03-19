import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/sign-up.dto';
import { TokenDto } from './dto/token-dto';
import { LocalAuthGuard } from './guards/local-auth.guard';

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
}
