import { defineTool } from '../tool';
import { ArrowBarToDown } from '@vicons/tabler';
export const tool = defineTool({
  name: 'Image Compressor',
  path: '/image-compressor',
  description: 'Compress JPG, PNG, and WebP images up to 90% smaller. Real-time preview, no uploads.',
  keywords: ['image', 'compress', 'optimize', 'jpg', 'png', 'webp', 'size', 'reduce'],
  component: () => import('./image-compressor.vue'),
  icon: ArrowBarToDown,
  createdAt: new Date(),
});
