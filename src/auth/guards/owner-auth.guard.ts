import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class OwnerGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const { user, params } = context.switchToHttp().getRequest();
    const routeParam = params.id;

    if (+routeParam !== user.id) {
      throw new HttpException(
        'Você não tem permissão para isso',
        HttpStatus.FORBIDDEN,
      );
    }

    return true;
  }
}
