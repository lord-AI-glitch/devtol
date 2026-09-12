import { defineTool } from '../tool';
import { Repeat } from '@vicons/tabler';
export const tool = defineTool({
  name: 'WebP Converter',
  path: '/webp-converter',
  description: 'Convert WebP to PNG/JPG or convert PNG/JPG to WebP format. Client-side processing.',
  keywords: ['webp', 'png', 'jpg', 'convert', 'image', 'format'],
  component: () => import('./webp-converter.vue'),
  icon: Repeat,
  createdAt: new Date(),
});
