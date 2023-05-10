import { ChannelType } from '@prisma/client';

export default [
  {
    id: 1,
    name: 'jobs',
    description: 'Canal para compartilhamento de vagas de emprego',
  },
  {
    id: 2,
    name: 'material',
    description: 'Canal para compartilhar materiais de estudo',
  },
  {
    id: 3,
    name: 'chat',
    description: 'Canal para conversa entre os integrantes da comunidade',
  },
] as ChannelType[];
