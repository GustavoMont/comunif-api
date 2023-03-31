import { SetMetadata } from '@nestjs/common';
import { RoleEnum } from 'src/models/User';

export const ROLES_KEY = 'role';
export const Roles = (...roles: RoleEnum[]) => SetMetadata(ROLES_KEY, roles);
