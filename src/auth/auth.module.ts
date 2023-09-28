import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { PrismaClient } from '@prisma/client';
import { UserModule } from 'src/user/user.module';
import { AuthService } from './auth.service';
import { LocalStrategy } from './strategies/local.strategy';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { MailModule } from 'src/mail/mail.module';
import { SecurityCodeModule } from 'src/security-code/security-code.module';
import { AuthRepository } from './auth.repository.service';
import { IAuthRepository } from './interfaces/IAuthRepository';
import { IAuthService } from './interfaces/IAuthService';

@Module({
  imports: [
    UserModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: {
        expiresIn: '1h',
      },
    }),
    MailModule,
    SecurityCodeModule,
  ],
  providers: [
    {
      provide: IAuthService,
      useClass: AuthService,
    },
    PrismaClient,
    LocalStrategy,
    JwtStrategy,
    {
      provide: IAuthRepository,
      useClass: AuthRepository,
    },
  ],
  controllers: [AuthController],
  exports: [IAuthService],
})
export class AuthModule {}
