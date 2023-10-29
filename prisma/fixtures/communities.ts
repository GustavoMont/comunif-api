import { Community } from '@prisma/client';
import { env } from '../../src/constants/env';

const communities: Community[] = [
  {
    id: 1,
    name: 'Topinar',
    banner: `${env.domain}/public/banner/default-Topinar-banner.webp`,
    isActive: true,
    subject: 'Ser top',
    adminId: 1,
  },
  {
    id: 2,
    name: 'Editores',
    banner: `${env.domain}/public/banner/default-Editores-banner.webp`,
    isActive: true,
    subject: 'Edição de imagens',
    adminId: 1,
  },
  {
    id: 3,
    name: 'PróximoJs',
    banner: null,
    isActive: true,
    subject: 'NextJs',
    adminId: 1,
  },
  {
    id: 4,
    name: 'Desativados',
    banner: null,
    isActive: false,
    subject: 'Não enche brother',
    adminId: 1,
  },
];

export default communities;
