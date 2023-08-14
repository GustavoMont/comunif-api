import {
  ExecutionContext,
  HttpException,
  HttpStatus,
  createParamDecorator,
} from '@nestjs/common';
import { Request } from 'express';

export const AccessToken = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request: Request = ctx.switchToHttp().getRequest();
    const accessToken = request.headers.authorization?.replace('Bearer ', '');
    if (!accessToken) {
      throw new HttpException(
        'Você não pode realizar esta ação',
        HttpStatus.UNAUTHORIZED,
      );
    }

    return accessToken;
  },
);
