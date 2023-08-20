import { Community } from '@prisma/client';
import { env } from 'constants/env';

const communities: Community[] = [
  {
    id: 1,
    name: 'Topinar',
    banner: `${env.domain}/public/banner/default-Topinar-banner.webp`,
    isActive: false,
    subject: 'Ser top',
  },
  {
    id: 2,
    name: 'Editores',
    banner: `${env.domain}/public/banner/default-Editores-banner.webp`,
    isActive: false,
    subject: 'Edição de imagens',
  },
];

export default communities;
