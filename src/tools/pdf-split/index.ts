import { Cut } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'Split PDF',
  path: '/pdf-split',
  description: 'Split or extract specific pages from a PDF file. Client-side processing, total privacy.',
  keywords: ['pdf', 'split', 'extract', 'pages', 'separate'],
  component: () => import('./pdf-split.vue'),
  icon: Cut,
  createdAt: new Date(),
});
