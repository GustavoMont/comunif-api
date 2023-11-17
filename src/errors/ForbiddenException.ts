import { HttpException, HttpStatus } from '@nestjs/common';

export class ForbiddenException extends HttpException {
  constructor() {
    super(
      'Você não tem permissão para executar essa ação',
      HttpStatus.FORBIDDEN,
    );
  }
}
