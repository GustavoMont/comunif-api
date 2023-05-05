import { RoleEnum } from 'src/models/User';

export abstract class Service {
  protected generateSkip = (page: number, take): number =>
    page === 0 ? 0 : (page - 1) * take;
  protected isAdmin = (role: RoleEnum) => role === RoleEnum.admin;
}
