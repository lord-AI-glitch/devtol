import { Droplet } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'PDF Watermark',
  path: '/pdf-watermark-tool',
  description: 'Add text watermarks to all pages of a PDF. Custom position, opacity, and font.',
  keywords: ['pdf', 'watermark', 'stamp', 'confidential', 'draft', 'overlay'],
  component: () => import('./pdf-watermark-tool.vue'),
  icon: Droplet,
  createdAt: new Date(),
});
