import { ChannelType } from '@prisma/client';

export default [
  {
    name: 'jobs',
    description: 'Canal para compartilhamento de vagas de emprego',
  },
  {
    name: 'material',
    description: 'Canal para compartilhar materiais de estudo',
  },
  {
    name: 'chat',
    description: 'Canal para conversa entre os integrantes da comunidade',
  },
] as ChannelType[];
