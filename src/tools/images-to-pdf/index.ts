import { defineTool } from '../tool';
import { FilePlus } from '@vicons/tabler';

export const tool = defineTool({
  name: 'Images to PDF',
  path: '/images-to-pdf',
  description: 'Convert JPG, PNG, or WebP images into a single PDF document. No server uploads.',
  keywords: ['images', 'pdf', 'jpg', 'png', 'convert', 'create', 'combine'],
  component: () => import('./images-to-pdf.vue'),
  icon: FilePlus,
  createdAt: new Date(),
});
