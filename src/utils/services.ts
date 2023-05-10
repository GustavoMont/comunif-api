import { HttpException, HttpStatus } from '@nestjs/common';
import { RoleEnum } from 'src/models/User';

export abstract class Service {
  protected handleForbiddenException = (role: RoleEnum) => {
    if (!this.isAdmin(role)) {
      throw new HttpException(
        'Você não tem permissão para executar essa ação',
        HttpStatus.FORBIDDEN,
      );
    }
  };
  protected generateSkip = (page: number, take): number =>
    page === 0 ? 0 : (page - 1) * take;
  protected isAdmin = (role: RoleEnum) => role === RoleEnum.admin;
}
