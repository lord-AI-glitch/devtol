import { Droplet } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'Image Watermark',
  path: '/image-watermark',
  description: 'Add text watermarks to photos with custom position, opacity and style.',
  keywords: ['watermark', 'image', 'text', 'overlay', 'stamp', 'photo'],
  component: () => import('./image-watermark.vue'),
  icon: Droplet,
  createdAt: new Date(),
});
