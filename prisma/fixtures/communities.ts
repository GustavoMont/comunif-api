import { Community } from '@prisma/client';

const communities: Community[] = [
  {
    id: 1,
    name: 'Topinar',
    banner: 'public/banner/default-Topinar-banner.webp',
    isActive: false,
    subject: 'Ser top',
  },
  {
    id: 2,
    name: 'Editores',
    banner: 'public/banner/default-Editores-banner.webp',
    isActive: false,
    subject: 'Edição de imagens',
  },
];

export default communities;
