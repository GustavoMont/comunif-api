import { Community } from '@prisma/client';

const communities: Community[] = [
  {
    id: 1,
    name: 'Topinar',
    banner: null,
    isActive: false,
    subject: 'Ser top',
  },
  {
    id: 2,
    name: 'Editores',
    banner: null,
    isActive: false,
    subject: 'Edição de imagens',
  },
];

export default communities;
