import { defineTool } from '../tool';
import { ArrowBarToDown } from '@vicons/tabler';

export const tool = defineTool({
  name: 'Compress PDF',
  path: '/pdf-compress',
  description: 'Reduce PDF file size with adjustable quality. 100% browser-based, no uploads.',
  keywords: ['pdf', 'compress', 'reduce', 'size', 'optimize'],
  component: () => import('./pdf-compress.vue'),
  icon: ArrowBarToDown,
  createdAt: new Date(),
});
