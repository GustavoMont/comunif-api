import { RoleEnum } from 'src/models/User';

export type RequestUser = { id: number; username: string; roles: RoleEnum[] };
