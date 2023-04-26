import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';

@Injectable()
export class OwnerGuard implements CanActivate {
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
