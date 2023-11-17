import { MinLength } from 'class-validator';

export class DeactivateUser {
  @MinLength(50, { message: 'Insira uma mensagem mais detalhada' })
  reason: string;
}
